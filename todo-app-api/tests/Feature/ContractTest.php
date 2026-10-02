<?php

namespace Tests\Feature;

use App\Mail\VerificationCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    private function guest(): array
    {
        $this->flushHeaders();

        return $this->postJson('/api/auth/guest', ['device_id' => (string) Str::uuid()])->assertCreated()->json('data');
    }

    private function register(string $email): array
    {
        $guest = $this->guest();
        $this->withToken($guest['token']);

        return $this->postJson('/api/auth/register', ['email' => $email, 'password' => ' password12 ', 'password_confirmation' => ' password12 '])->assertCreated()->json('data');
    }

    private function key(): static
    {
        return $this->withHeader('Idempotency-Key', (string) Str::uuid());
    }

    private function list(string $name = 'Work'): string
    {
        $id = (string) Str::uuid();
        $this->key()->postJson('/api/todo-lists', ['id' => $id, 'name' => $name])->assertCreated();

        return $id;
    }

    public function test_verification_membership_revoke_layout_and_receipt_recovery(): void
    {
        Mail::fake();
        $owner = $this->register('owner@example.com');
        $this->withToken($owner['token']);
        $id = $this->list();
        $share = $this->key()->postJson('/api/todo-lists/'.$id.'/shares', ['email' => ' Friend@Example.com '])->assertCreated()->json('data.id');
        $friend = $this->register('friend@example.com');
        $this->withToken($friend['token']);
        $this->post('/api/auth/email-verification/request')->assertStatus(202);
        $code = null;
        Mail::assertSent(VerificationCode::class, function ($mail) use (&$code) {
            $code = $mail->code;

            return true;
        });
        $this->post('/api/auth/email-verification/request')->assertStatus(429)->assertHeader('Retry-After');
        $this->postJson('/api/auth/email-verification/confirm', ['code' => $code])->assertOk()->assertJsonPath('data.user.email', 'friend@example.com');
        $this->postJson('/api/auth/email-verification/confirm', ['code' => $code])->assertUnprocessable()->assertJsonPath('error.code', 'INVALID_VERIFICATION_CODE');
        $accept = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', $accept)->post('/api/shares/'.$share.'/accept')->assertOk()->assertJsonPath('data.role', 'member');
        $this->post('/api/shares/'.$share.'/accept')->assertOk();
        $this->key()->patchJson('/api/settings', ['list_view_layout' => [$id]])->assertOk();
        $this->key()->patchJson('/api/todo-lists/'.$id, ['name' => 'Changed'])->assertForbidden()->assertJsonPath('error.code', 'OWNER_REQUIRED');
        $this->key()->postJson('/api/todos', ['id' => (string) Str::uuid(), 'todo_list_id' => $id, 'name' => 'Member task'])->assertCreated();
        $this->key()->post('/api/shares/'.$share.'/decline')->assertStatus(409)->assertJsonPath('error.code', 'SHARE_NOT_PENDING');
        $this->withToken($owner['token'])->key()->delete('/api/todo-lists/'.$id.'/shares/'.$share)->assertNoContent();
        $this->withToken($friend['token'])->getJson('/api/todo-lists/'.$id)->assertNotFound();
        $this->getJson('/api/settings')->assertJsonPath('data.list_view_layout', []);
        $this->withHeader('Idempotency-Key', $accept)->post('/api/shares/'.$share.'/accept')->assertNotFound();
    }

    public function test_guest_conversion_preserves_identity_and_login_does_not_merge(): void
    {
        $g = $this->guest();
        $this->withToken($g['token']);
        $id = $this->list();
        $registered = $this->postJson('/api/auth/register', ['email' => ' USER@Example.com ', 'password' => 'password12', 'password_confirmation' => 'password12'])->assertCreated()->assertJsonPath('data.session.account.id', $g['session']['account']['id'])->json('data');
        $this->withToken($g['token'])->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken($registered['token'])->getJson('/api/todo-lists/'.$id)->assertOk();
        $abandoned = $this->guest();
        $this->withToken($abandoned['token']);
        $other = $this->list('Abandoned');
        $logged = $this->postJson('/api/auth/login', ['email' => 'user@example.com', 'password' => 'password12', 'device_id' => (string) Str::uuid()])->assertOk()->json('data.token');
        $this->withToken($abandoned['token'])->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken($logged)->getJson('/api/todo-lists/'.$other)->assertNotFound();
        $this->getJson('/api/todo-lists/'.$id)->assertOk();
        $this->post('/api/auth/logout')->assertNoContent();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->withToken($registered['token'])->getJson('/api/auth/me')->assertOk();
        $this->flushHeaders();
        $this->postJson('/api/auth/login', ['email' => 'user@example.com', 'password' => 'incorrect12', 'device_id' => (string) Str::uuid()])->assertUnauthorized()->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
        $this->withToken('invalid')->postJson('/api/auth/login', ['email' => 'user@example.com', 'password' => 'password12', 'device_id' => (string) Str::uuid()])->assertUnauthorized()->assertJsonPath('error.code', 'UNAUTHENTICATED');
    }

    public function test_validation_errors_headers_head_and_deadline_precision(): void
    {
        $g = $this->guest();
        $this->withToken($g['token']);
        $id = $this->list();
        $tid = (string) Str::uuid();
        $key = (string) Str::uuid();
        $this->withHeader('Idempotency-Key', $key)->postJson('/api/todos', ['id' => $tid, 'todo_list_id' => $id, 'name' => 'Task', 'description' => '  ', 'deadline' => '2026-10-02T18:00:00.123+08:00'])->assertCreated()->assertJsonPath('data.deadline', '2026-10-02T10:00:00.123Z')->assertJsonPath('data.description', '  ');
        $this->withHeader('Idempotency-Key', $key)->postJson('/api/todos', ['id' => $tid, 'todo_list_id' => $id, 'name' => 'Changed'])->assertStatus(409)->assertJsonPath('error.code', 'IDEMPOTENCY_KEY_REUSED');
        $this->key()->patchJson('/api/todos/'.$tid, ['description' => null, 'deadline' => null, 'is_done' => false])->assertOk()->assertJsonPath('data.version', 2);
        $this->key()->putJson('/api/todos/'.$tid, ['name' => 'Task'])->assertUnprocessable();
        $this->key()->patchJson('/api/todos/'.$tid, ['name' => null])->assertUnprocessable();
        $this->key()->patchJson('/api/todos/'.$tid, ['version' => 4])->assertUnprocessable();
        $this->key()->patchJson('/api/todos/'.$tid, ['is_done' => 'false'])->assertUnprocessable();
        $this->getJson('/api/todos?is_done=0')->assertUnprocessable();
        $this->getJson('/api/todos?todo_list_id='.(string) Str::uuid())->assertNotFound();
        $this->json('HEAD', '/api/todo-lists/'.$id)->assertOk()->assertHeader('X-Eves-API-Version', '1')->assertHeader('Cache-Control', 'no-store, private')->assertContent('');
        $this->json('HEAD', '/api/todos/'.(string) Str::uuid())->assertNotFound()->assertContent('');
        $this->call('POST', '/api/auth/guest', [], [], [], ['CONTENT_TYPE' => 'application/json'], '{')->assertStatus(400)->assertJsonPath('error.code', 'INVALID_JSON');
        $this->call('POST', '/api/auth/guest', [], [], [], ['CONTENT_TYPE' => 'text/plain'], '{}')->assertStatus(415);
        $this->key()->patchJson('/api/settings',['list_view_layout' => [$id, $id]])->assertUnprocessable();
        $this->key()->patchJson('/api/settings',['list_view_layout' => [(string) Str::uuid()]])->assertUnprocessable();
    }
}
