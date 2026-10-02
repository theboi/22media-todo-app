<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('user_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $t->uuid('first_device')->nullable();
            $t->boolean('has_created_list')->default(false);
            $t->timestamps();
        });
        DB::statement("CREATE TRIGGER accounts_identity_insert BEFORE INSERT ON accounts WHEN (NEW.user_id IS NULL) = (NEW.first_device IS NULL) BEGIN SELECT RAISE(ABORT, 'account identity must have exactly one value'); END");
        DB::statement("CREATE TRIGGER accounts_identity_update BEFORE UPDATE ON accounts WHEN (NEW.user_id IS NULL) = (NEW.first_device IS NULL) BEGIN SELECT RAISE(ABORT, 'account identity must have exactly one value'); END");
        Schema::create('user_settings', function (Blueprint $t) {
            $t->foreignUuid('account_id')->primary()->constrained('accounts')->cascadeOnDelete();
            $t->json('list_view_layout')->default('[]');
            $t->timestamps();
        });
        Schema::create('todo_lists', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('owner_account_id')->constrained('accounts')->cascadeOnDelete();
            $t->index(['owner_account_id', 'created_at', 'id']);
            $t->string('name', 120);
            $t->text('description')->nullable();
            $t->string('icon')->default('droplet');
            $t->string('color')->default('#22C55E');
            $t->timestamps();
        });
        Schema::create('todos', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('todo_list_id')->constrained()->cascadeOnDelete();
            $t->index(['todo_list_id', 'created_at', 'id']);
            $t->string('name', 200);
            $t->text('description')->nullable();
            $t->boolean('is_done')->default(false);
            $t->timestamp('deadline', 3)->nullable();
            $t->unsignedInteger('version')->default(1);
            $t->timestamps();
        });
        Schema::create('shares', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('todo_list_id')->constrained()->cascadeOnDelete();
            $t->foreignUuid('shared_by_user_id')->constrained('users')->cascadeOnDelete();
            $t->string('email', 254)->index();
            $t->string('status')->default('pending');
            $t->timestamps();
            $t->unique(['todo_list_id', 'email']);
        });
        Schema::create('mutation_receipts', function (Blueprint $t) {
            $t->id();
            $t->foreignUuid('account_id')->constrained()->cascadeOnDelete();
            $t->uuid('key');
            $t->string('fingerprint', 64);
            $t->unsignedSmallInteger('status');
            $t->string('resource_type')->nullable();
            $t->uuid('resource_id')->nullable();
            $t->timestamps();
            $t->unique(['account_id', 'key']);
        });
    }

    public function down(): void
    {
        foreach (['mutation_receipts', 'shares', 'todos', 'todo_lists', 'user_settings', 'accounts'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
