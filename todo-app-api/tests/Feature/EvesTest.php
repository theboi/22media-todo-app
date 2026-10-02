<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class EvesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_crud_revisions_receipts_and_snapshot(): void
    {
        $token = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data.token');
        $this->withToken($token);
        $id = (string) Str::uuid();
        $key = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', $key)->postJson('/api/todo-lists', ['id' => $id, 'name' => ' Work '])->assertCreated()->assertJsonPath('data.name', 'Work');
        $this->postJson('/api/todo-lists', ['id' => $id, 'name' => ' Work '])->assertCreated();
        $tid = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todos', ['id' => $tid, 'todo_list_id' => $id, 'name' => 'Task'])->assertCreated()->assertJsonPath('data.version', 1);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$tid, ['is_done' => true])->assertOk()->assertJsonPath('data.version', 2);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$tid, ['is_done' => true])->assertOk()->assertJsonPath('data.version', 2);
        $this->getJson('/api/sync/snapshot')->assertOk()->assertJsonCount(1, 'data.todos')->assertJsonPath('data.session.settings.list_view_layout.0', $id);
        $delete = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', $delete)->delete('/api/todo-lists/'.$id)->assertNoContent();
        $this->delete('/api/todo-lists/'.$id)->assertNoContent();
        $this->withHeader('Idempotency-Key', $key)->postJson('/api/todo-lists', ['id' => $id, 'name' => ' Work '])->assertNotFound();
    }

    public function test_strict_validation_and_hidden_cross_account_resources(): void
    {
        $token = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data.token');
        $this->withToken($token);
        $id = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertCreated();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todos', ['id' => (string) Str::uuid(), 'todo_list_id' => $id, 'name' => 'Task', 'is_done' => 1])->assertUnprocessable();
        $this->getJson('/api/todo-lists?unknown=1')->assertUnprocessable();
        $other = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data.token');
        $this->withToken($other)->getJson('/api/todo-lists/'.$id)->assertNotFound();
    }

    public function test_registration_login_and_sharing(): void
    {
        $token = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->json('data.token');
        $this->withToken($token);
        $token = $this->postJson('/api/auth/register', ['email' => ' OWNER@example.com ', 'password' => 'password12', 'password_confirmation' => 'password12'])->assertCreated()->assertJsonPath('data.session.account.first_device', null)->json('data.token');
        $this->withToken($token);
        $id = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertCreated();
        $share = $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todo-lists/'.$id.'/shares', ['email' => 'friend@example.com'])->assertCreated()->json('data.id');
        $guest = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->json('data.token');
        $this->withToken($guest);
        $friend = $this->postJson('/api/auth/register', ['email' => 'friend@example.com', 'password' => 'password12', 'password_confirmation' => 'password12'])->assertCreated()->json('data.token');
        $this->withToken($friend);
        $this->getJson('/api/shares/pending')->assertOk()->assertJsonCount(1, 'data');
        $this->withHeader('Idempotency-Key',(string) Str::uuid())->post('/api/shares/'.$share.'/accept')->assertForbidden();
    }
}
