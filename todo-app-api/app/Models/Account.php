<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class Account extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $guarded = [];

    protected function casts(): array
    {
        return ['has_created_list' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function registered(): bool
    {
        return $this->user_id !== null;
    }

    public function accessibleLists(): Builder
    {
        $this->loadMissing(['user', 'settings']);

        return TodoList::query()->where(fn ($query) => $query->where('owner_account_id', $this->id)->orWhereHas('shares', fn ($q) => $q->where('email', $this->user?->email ?? '')->where('status', 'accepted')->when(! $this->user?->email_verified_at, fn ($q) => $q->whereRaw('1=0'))));
    }

    public function newUniqueId(): string
    {
        return (string) Str::uuid();
    }

    public function settings(): HasOne
    {
        return $this->hasOne(UserSetting::class);
    }
}
