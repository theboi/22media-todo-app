<?php

namespace App\Http\Middleware;

use App\Actions\Retry\ReplayReceipt;
use App\Http\Requests\ApiRequest;
use App\Models\MutationReceipt;
use App\Support\ApiError;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdempotentMutation
{
    public function handle(Request $r, Closure $next)
    {
        $key = $r->header('Idempotency-Key');
        if (! is_string($key) || ! preg_match(ApiRequest::UUID, $key)) {
            throw new ApiError('VALIDATION_FAILED', 422, ['Idempotency-Key' => ['A lowercase UUID v4 is required.']]);
        }
        // Validate and normalize before computing the exact semantic request fingerprint.
        $validated = app(ApiRequest::class);
        $payload = $validated->payload();
        ksort($payload);
        $fingerprint = hash('sha256', json_encode([$r->method(), $r->path(), $payload], JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($r, $next, $key, $fingerprint) {
            // SQLite serializes writers; touching the principal obtains its write lock before receipt lookup.
            DB::table('accounts')->where('id', $r->user()->id)->update(['id' => $r->user()->id]);
            $r->user()->refresh()->load(['user', 'settings']);
            $receipt = MutationReceipt::where('account_id', $r->user()->id)->where('key', $key)->first();
            if ($receipt) {
                if ($receipt->fingerprint !== $fingerprint) {
                    throw new ApiError('IDEMPOTENCY_KEY_REUSED', 409);
                }

                return app(ReplayReceipt::class)($receipt, $r);
            }
            $response = $next($r);
            $status = $response->getStatusCode();
            if ($status >= 200 && $status < 300) {
                $data = json_decode($response->getContent(), true)['data'] ?? [];
                $type = isset($data['todo_list_id']) ? (isset($data['version']) ? 'todo' : 'share') : (isset($data['owner_account_id']) ? 'list' : (isset($data['list_view_layout']) ? 'settings' : null));
                MutationReceipt::create(['account_id' => $r->user()->id, 'key' => $key, 'fingerprint' => $fingerprint, 'status' => $status, 'resource_type' => $type, 'resource_id' => $data['id'] ?? null]);
            }

            return $response;
        }, 3);
    }
}
