<?php

namespace App\Support;

use App\Models\Account;
use App\Models\Todo;
use App\Models\TodoList;
use Illuminate\Support\Facades\Gate;

class Access
{
    public static function list(Account $a, string $id, bool $owner = false): TodoList
    {
        $list = $a->accessibleLists()->whereKey($id)->firstOrFail();
        Gate::forUser($a)->authorize($owner ? 'update' : 'view', $list);

        return $list;
    }

    public static function todo(Account $a, string $id): Todo
    {
        $todo = Todo::whereKey($id)->whereIn('todo_list_id', $a->accessibleLists()->select('id'))->firstOrFail();
        Gate::forUser($a)->authorize('view', $todo);

        return $todo;
    }

    public static function registered(Account $a): void
    {
        if (! $a->registered()) {
            throw new ApiError('REGISTERED_ACCOUNT_REQUIRED', 403);
        }
    }

    public static function cleanLayout(string $id, ?string $accountId = null): void
    {
        Account::with('settings')->when($accountId, fn ($q) => $q->whereKey($accountId))->get()->each(function ($a) use ($id) {
            $layout = array_values(array_filter($a->settings->list_view_layout, fn ($value) => $value !== $id));
            if ($layout !== $a->settings->list_view_layout) {
                $a->settings->update(['list_view_layout' => $layout]);
            }
        });
    }
}
