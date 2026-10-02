<?php

namespace App\Actions\Retry;

use App\Http\Resources\ShareResource;
use App\Http\Resources\TodoListResource;
use App\Http\Resources\TodoResource;
use App\Models\MutationReceipt;
use App\Models\Share;
use App\Models\Todo;
use App\Support\ApiError;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReplayReceipt
{
    public function __invoke(MutationReceipt $receipt, Request $r)
    {
        if ($receipt->status === 204) {
            return response()->noContent();
        }
        $a = $r->user()->load(['user', 'settings']);
        $data = match ($receipt->resource_type) {
            'list' => new TodoListResource($a->accessibleLists()->whereKey($receipt->resource_id)->firstOrFail()),
            'todo' => new TodoResource(Todo::whereKey($receipt->resource_id)->whereIn('todo_list_id', $a->accessibleLists()->select('id'))->firstOrFail()),
            'share' => $this->share($receipt, $r),
            'settings' => ['list_view_layout' => $a->fresh()->settings->list_view_layout],
            default => throw new ApiError('NOT_FOUND', 404)
        };

        return response()->json(['data' => $data instanceof JsonResource ? $data->resolve($r) : $data], $receipt->status);
    }

    private function share(MutationReceipt $receipt, Request $r): ShareResource
    {
        $a = $r->user();
        $s = Share::with(['todoList', 'sharedBy'])->findOrFail($receipt->resource_id);
        if ($s->todoList->owner_account_id !== $a->id && $s->email !== $a->user?->email) {
            throw new ApiError('NOT_FOUND', 404);
        }

        return new ShareResource($s);
    }
}
