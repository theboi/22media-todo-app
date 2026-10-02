<?php

namespace Tests\Feature;

use App\Http\Requests\ApiRequest;
use App\Mail\VerificationCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class EdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    private function guest(): string
    {
        $this->flushHeaders();

        return $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data.token');
    }

    private function key(): string
    {
        $key = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', $key);

        return $key;
    }

    public function test_exact_json_shapes_and_get_body_unknown_fields(): void
    {
        $this->withToken($this->guest());
        $this->key();
        $this->patchJson('/api/settings', ['list_view_layout' => (object) []])->assertUnprocessable();
        $this->json('GET', '/api/settings', ['oops' => true])->assertUnprocessable();
        $id = (string) Str::uuid();
        $this->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertCreated();
        $this->key();
        $this->postJson('/api/todos', ['id' => (string) Str::uuid(), 'todo_list_id' => $id, 'name' => 'Task', 'is_done' => null])->assertUnprocessable();
    }

    public function test_failed_mutation_rolls_back_and_settings_replays_current_layout(): void
    {
        $this->withToken($this->guest());
        $id = (string) Str::uuid();
        $create = $this->key();
        $this->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertCreated();
        $settings = $this->key();
        $this->patchJson('/api/settings', ['list_view_layout' => [$id]])->assertOk();
        $failed = $this->key();
        $this->patchJson('/api/settings', ['list_view_layout' => [(string) Str::uuid()]])->assertUnprocessable();
        $this->assertDatabaseMissing('mutation_receipts', ['key' => $failed]);
        $this->key();
        $this->delete('/api/todo-lists/'.$id)->assertNoContent();
        $this->withHeader('Idempotency-Key', $settings)->patchJson('/api/settings', ['list_view_layout' => [$id]])->assertOk()->assertJsonPath('data.list_view_layout', []);
        $this->withHeader('Idempotency-Key', $create)->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertNotFound();
        $this->assertDatabaseMissing('todo_lists', ['id' => $id]);
        $s = $this->getJson('/api/sync/snapshot')->assertOk()->json('data');
        $this->assertArrayNotHasKey('version', $s['session']['settings']);
        $this->assertCount(0, $s['todo_lists']);
        $this->key();
        $second = (string) Str::uuid();
        $this->postJson('/api/todo-lists', ['id' => $second, 'name' => 'Second'])->assertCreated();
        $s = $this->getJson('/api/sync/snapshot')->assertOk()->json('data');
        $this->assertArrayNotHasKey('version', $s['todo_lists'][0]);
        $this->assertSame([], $s['session']['settings']['list_view_layout']);
    }

    public function test_verification_expiry_resend_and_five_failures(): void
    {
        Mail::fake();
        $this->withToken($this->guest());
        $token = $this->postJson('/api/auth/register', ['email' => 'test@example.com', 'password' => 'password12', 'password_confirmation' => 'password12'])->assertCreated()->json('data.token');
        $this->withToken($token);
        $this->post('/api/auth/email-verification/request')->assertStatus(202);
        $code = Mail::sent(VerificationCode::class)->last()->code;
        $this->travel(11)->minutes();
        $this->postJson('/api/auth/email-verification/confirm', ['code' => $code])->assertUnprocessable();
        $this->post('/api/auth/email-verification/request')->assertStatus(202);
        $newCode = Mail::sent(VerificationCode::class)->last()->code;
        $this->travel(1)->minutes();
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/email-verification/confirm', ['code' => $newCode === '000000' ? '999999' : '000000'])->assertUnprocessable();
        }
        $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'verification_hash' => null]);
        $this->postJson('/api/auth/email-verification/confirm', ['code' => $newCode])->assertStatus(429)->assertHeader('Retry-After');
        $this->travel(1)->minutes();
        $this->postJson('/api/auth/email-verification/confirm', ['code' => $newCode])->assertUnprocessable();
    }

    public function test_head_unauthenticated_error_and_missing_idempotency_key(): void
    {
        $this->json('HEAD', '/api/settings')->assertUnauthorized()->assertContent('')->assertHeader('X-Eves-API-Version', '1');
        $this->withToken($this->guest());
        $this->postJson('/api/todo-lists', ['id' => (string) Str::uuid(), 'name' => 'Work'])->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_FAILED');
    }

    public function test_server_identity_ids_are_uuid_v4(): void
    {
        $guest = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data');
        $this->assertMatchesRegularExpression(ApiRequest::UUID, $guest['session']['account']['id']);
        $this->withToken($guest['token']);
        $registered = $this->postJson('/api/auth/register', ['email' => 'uuid@example.com', 'password' => 'password12', 'password_confirmation' => 'password12'])->assertCreated()->json('data');
        $this->assertMatchesRegularExpression(ApiRequest::UUID, $registered['session']['user']['id']);
        $this->withToken($registered['token']);
        $id = (string) Str::uuid();
        $this->key();
        $this->postJson('/api/todo-lists', ['id' => $id, 'name' => 'Work'])->assertCreated();
        $this->key();
        $share = $this->postJson('/api/todo-lists/'.$id.'/shares', ['email' => 'friend@example.com'])->assertCreated()->json('data.id');
        $this->assertMatchesRegularExpression(ApiRequest::UUID, $share);
    }

    public function test_guest_has_account_scoped_user_settings_record(): void
    {
        $guest = $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data');
        $this->assertDatabaseHas('user_settings', ['account_id' => $guest['session']['account']['id'], 'list_view_layout' => '[]']);
    }
}
