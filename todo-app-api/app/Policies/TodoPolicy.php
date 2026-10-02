<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\Todo;

class TodoPolicy
{
    public function view(Account $account, Todo $todo): bool
    {
        return $account->accessibleLists()->where('id', $todo->todo_list_id)->exists();
    }

    public function update(Account $account, Todo $todo): bool
    {
        return $this->view($account, $todo);
    }

    public function delete(Account $account, Todo $todo): bool
    {
        return $this->view($account, $todo);
    }
}
