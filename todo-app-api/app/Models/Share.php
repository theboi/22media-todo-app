<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Share extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function todoList(): BelongsTo
    {
        return $this->belongsTo(TodoList::class);
    }

    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by_user_id');
    }

    public function newUniqueId(): string
    {
        return (string) Str::uuid();
    }
}
