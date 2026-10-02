<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\TodoList;
use Illuminate\Auth\Access\Response;

class TodoListPolicy
{
    public function view(Account $account, TodoList $list): bool
    {
        return $account->accessibleLists()->where('id', $list->id)->exists();
    }

    public function update(Account $account, TodoList $list): Response
    {
        return $account->id === $list->owner_account_id ? Response::allow() : Response::deny('OWNER_REQUIRED');
    }

    public function delete(Account $account, TodoList $list): Response
    {
        return $this->update($account, $list);
    }
}
