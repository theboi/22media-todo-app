<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class TodoCompletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_completion_time_tracks_transitions_and_survives_retries_and_edits(): void
    {
        $guest = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data');
        $this->withToken($guest['token']);
        $listId = (string) Str::uuid();
        $todoId = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todo-lists', ['id' => $listId, 'name' => 'Work'])->assertCreated();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todos', ['id' => $todoId, 'todo_list_id' => $listId, 'name' => 'Task'])->assertCreated()->assertJsonPath('data.completed_at', null);
        $this->travelTo(now()->setDate(2026, 10, 4)->setTime(12, 0, 0));
        $key = (string) Str::uuid();
        $completed = $this->withHeader('Idempotency-Key', $key)->patchJson('/api/todos/'.$todoId, ['is_done' => true])->assertOk()->assertJsonPath('data.version', 2)->json('data.completed_at');
        $this->assertSame('2026-10-04T12:00:00.000Z', $completed);
        $this->travel(1)->hours();
        $this->withHeader('Idempotency-Key', $key)->patchJson('/api/todos/'.$todoId, ['is_done' => true])->assertOk()->assertJsonPath('data.completed_at', $completed)->assertJsonPath('data.version', 2);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$todoId, ['is_done' => true])->assertOk()->assertJsonPath('data.completed_at', $completed)->assertJsonPath('data.version', 2);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$todoId, ['name' => 'Renamed'])->assertOk()->assertJsonPath('data.completed_at', $completed)->assertJsonPath('data.version', 3);
        $this->getJson('/api/todo-lists/'.$listId)->assertOk()->assertJsonPath('data.todos.0.completed_at', $completed);
        $this->getJson('/api/todos')->assertOk()->assertJsonPath('data.0.completed_at', $completed);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$todoId, ['completed_at' => null])->assertUnprocessable();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->patchJson('/api/todos/'.$todoId, ['is_done' => false])->assertOk()->assertJsonPath('data.completed_at', null)->assertJsonPath('data.version', 4);
        $this->travel(1)->hours();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->putJson('/api/todos/'.$todoId, ['name' => 'Renamed', 'description' => null, 'deadline' => null, 'is_done' => true])->assertOk()->assertJsonPath('data.completed_at', '2026-10-04T14:00:00.000Z')->assertJsonPath('data.version', 5);
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/todos', ['id' => (string) Str::uuid(), 'todo_list_id' => $listId, 'name' => 'Already done', 'is_done' => true])->assertCreated()->assertJsonPath('data.completed_at', '2026-10-04T14:00:00.000Z');
    }
}
