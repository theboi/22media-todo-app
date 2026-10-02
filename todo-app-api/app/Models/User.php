<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class User extends Model
{
    use HasUuids, \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $guarded = [];

    protected $hidden = ['password', 'verification_hash'];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'verification_expires_at' => 'datetime'];
    }

    public function account(): HasOne
    {
        return $this->hasOne(Account::class);
    }

    public function newUniqueId(): string
    {
        return (string) Str::uuid();
    }
}
