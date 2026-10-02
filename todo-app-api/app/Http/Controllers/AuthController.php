<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Http\Resources\SessionResource;
use App\Mail\VerificationCode;
use App\Models\Account;
use App\Models\User;
use App\Support\ApiError;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    private function token(Account $account, int $status): JsonResponse
    {
        $account->load(['user', 'settings']);

        return response()->json(['data' => ['token_type' => 'Bearer', 'token' => $account->createToken('device')->plainTextToken, 'session' => (new SessionResource($account))->resolve()]], $status);
    }

    public function guest(ApiRequest $r): JsonResponse
    {
        return DB::transaction(function () use ($r) {
            $account = Account::create(['first_device' => $r->validated('device_id')]);
            $account->settings()->create(['list_view_layout' => []]);

            return $this->token($account, 201);
        });
    }

    public function register(ApiRequest $r): JsonResponse
    {
        $a = $r->user();
        if ($a->registered()) {
            throw new ApiError('ALREADY_REGISTERED', 409);
        }
        $p = $r->validated();
        if (User::where('email', $p['email'])->exists()) {
            throw new ApiError('EMAIL_ALREADY_REGISTERED', 409);
        }
        try {
            return DB::transaction(function () use ($a, $p) {
                DB::table('accounts')->where('id', $a->id)->update(['id' => $a->id]);
                $a->refresh();
                if ($a->registered()) {
                    throw new ApiError('ALREADY_REGISTERED', 409);
                }
                $u = User::create(['email' => $p['email'], 'password' => Hash::make($p['password'])]);
                $a->update(['user_id' => $u->id, 'first_device' => null]);
                $a->currentAccessToken()->delete();

                return $this->token($a, 201);
            });
        } catch (UniqueConstraintViolationException) {
            throw new ApiError('EMAIL_ALREADY_REGISTERED', 409);
        }
    }

    public function login(ApiRequest $r): JsonResponse
    {
        $guest = null;
        if ($r->bearerToken()) {
            $token = PersonalAccessToken::findToken($r->bearerToken());
            $guest = $token?->tokenable;
            if (! $guest instanceof Account) {
                throw new ApiError('UNAUTHENTICATED', 401);
            }
            if ($guest->registered()) {
                throw new ApiError('ALREADY_REGISTERED', 409);
            }
        }
        $p = $r->validated();
        $u = User::where('email', $p['email'])->first();
        if (! $u || ! Hash::check($p['password'], $u->password)) {
            throw new ApiError('INVALID_CREDENTIALS', 401);
        }

        return DB::transaction(function () use ($u, $guest, $r) {
            if ($guest) {
                PersonalAccessToken::findToken($r->bearerToken())->delete();
            }

            return $this->token($u->account, 200);
        });
    }

    public function me(ApiRequest $r): SessionResource
    {
        return new SessionResource($r->user()->load(['user', 'settings']));
    }

    public function logout(ApiRequest $r): Response
    {
        $this->registered($r);
        $r->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    private function registered(ApiRequest $r): Account
    {
        $a = $r->user()->load(['user', 'settings']);
        if (! $a->registered()) {
            throw new ApiError('REGISTERED_ACCOUNT_REQUIRED', 403);
        }

        return $a;
    }

    private function limit(string $key, int $max, int $seconds): void
    {
        if (RateLimiter::tooManyAttempts($key, $max)) {
            throw new ApiError('RATE_LIMITED', 429, [], ['Retry-After' => RateLimiter::availableIn($key)]);
        }
        RateLimiter::hit($key, $seconds);
    }

    public function requestVerification(ApiRequest $r): JsonResponse
    {
        $a = $this->registered($r);
        if ($a->user->email_verified_at) {
            return response()->json(['data' => ['status' => 'already_verified']]);
        }
        $this->limit('send-minute:'.$a->id, 1, 60);
        $this->limit('send-hour:'.$a->id, 5, 3600);
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $a->user->update(['verification_hash' => Hash::make($code), 'verification_expires_at' => now()->addMinutes(10), 'verification_failures' => 0]);
        Mail::to($a->user->email)->send(new VerificationCode($code));

        return response()->json(['data' => ['status' => 'sent']], 202);
    }

    public function confirm(ApiRequest $r): SessionResource
    {
        $a = $this->registered($r);
        $this->limit('confirm:'.$a->id, 5, 60);
        $valid = DB::transaction(function () use ($a, $r) {
            $u = User::whereKey($a->user_id)->lockForUpdate()->first();
            if (! $u->verification_hash || ! $u->verification_expires_at?->isFuture() || ! Hash::check($r->validated('code'), $u->verification_hash)) {
                $n = $u->verification_failures + 1;
                $u->update(['verification_failures' => $n, 'verification_hash' => $n >= 5 ? null : $u->verification_hash]);

                return false;
            }
            $u->update(['email_verified_at' => now(), 'verification_hash' => null, 'verification_expires_at' => null]);

            return true;
        });
        if (! $valid) {
            throw new ApiError('INVALID_VERIFICATION_CODE', 422);
        }

        return new SessionResource($a->fresh()->load(['user', 'settings']));
    }
}
