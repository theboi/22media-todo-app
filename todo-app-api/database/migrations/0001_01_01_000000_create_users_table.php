<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('email', 254)->unique();
            $t->string('password');
            $t->timestamp('email_verified_at')->nullable();
            $t->string('verification_hash')->nullable();
            $t->timestamp('verification_expires_at')->nullable();
            $t->unsignedInteger('verification_failures')->default(0);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
