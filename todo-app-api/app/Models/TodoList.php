<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class TodoList extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function shares(): HasMany
    {
        return $this->hasMany(Share::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    public function newUniqueId(): string
    {
        return (string) Str::uuid();
    }
}
