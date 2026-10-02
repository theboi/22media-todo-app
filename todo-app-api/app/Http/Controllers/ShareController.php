<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Http\Resources\ShareResource;
use App\Http\Resources\TodoListResource;
use App\Models\Account;
use App\Models\Share;
use App\Models\TodoList;
use App\Support\Access;
use App\Support\ApiError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ShareController extends Controller
{
    private function owner(ApiRequest $r, string $id): TodoList
    {
        $list = Access::list($r->user(), $id, true);
        Access::registered($r->user());

        return $list;
    }

    private function recipient(ApiRequest $r, string $id): Share
    {
        Access::registered($r->user());

        return Share::with(['todoList', 'sharedBy'])->whereKey($id)->where('email', $r->user()->user->email)->firstOrFail();
    }

    public function index(ApiRequest $r, string $id): AnonymousResourceCollection
    {
        $this->owner($r, $id);

        return ShareResource::collection(Share::with(['todoList', 'sharedBy'])->where('todo_list_id', $id)->orderBy('created_at')->orderBy('id')->get());
    }

    public function store(ApiRequest $r, string $id): JsonResponse
    {
        $this->owner($r, $id);
        $email = $r->validated('email');
        if ($email === $r->user()->user->email) {
            throw new ApiError('VALIDATION_FAILED', 422, ['email' => ['Cannot share with yourself.']]);
        }
        $share = Share::where('todo_list_id', $id)->where('email', $email)->first();
        $status = $share ? 200 : 201;
        $share ??= Share::create(['todo_list_id' => $id, 'email' => $email, 'shared_by_user_id' => $r->user()->user_id]);

        return (new ShareResource($share->load(['todoList', 'sharedBy'])))->response()->setStatusCode($status);
    }

    public function pending(ApiRequest $r): AnonymousResourceCollection
    {
        Access::registered($r->user());

        return ShareResource::collection(Share::with(['todoList', 'sharedBy'])->where('email', $r->user()->user->email)->where('status', 'pending')->orderBy('created_at')->orderBy('id')->get());
    }

    public function accept(ApiRequest $r, string $id): TodoListResource
    {
        $s = $this->recipient($r, $id);
        if (! $r->user()->user->email_verified_at) {
            throw new ApiError('EMAIL_NOT_VERIFIED', 403);
        }
        if ($s->status !== 'accepted') {
            $s->update(['status' => 'accepted']);
        }

        return new TodoListResource($s->todoList);
    }

    public function decline(ApiRequest $r, string $id): Response
    {
        $s = $this->recipient($r, $id);
        if ($s->status !== 'pending') {
            throw new ApiError('SHARE_NOT_PENDING', 409);
        }
        $s->delete();

        return response()->noContent();
    }

    public function destroy(ApiRequest $r, string $id, string $share): Response
    {
        $this->owner($r, $id);
        $s = Share::where('todo_list_id', $id)->whereKey($share)->firstOrFail();
        $a = Account::whereHas('user', fn ($q) => $q->where('email', $s->email))->first();
        if ($a) {
            Access::cleanLayout($id, $a->id);
        }
        $s->delete();

        return response()->noContent();
    }

    public function leave(ApiRequest $r, string $id): Response
    {
        $list = Access::list($r->user(), $id);
        Access::registered($r->user());
        if ($list->owner_account_id === $r->user()->id) {
            throw new ApiError('OWNER_CANNOT_LEAVE', 409);
        }
        Share::where('todo_list_id', $id)->where('email', $r->user()->user->email)->where('status', 'accepted')->firstOrFail()->delete();
        Access::cleanLayout($id, $r->user()->id);

        return response()->noContent();
    }
}
