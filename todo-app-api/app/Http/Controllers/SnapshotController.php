<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Http\Resources\SessionResource;
use App\Http\Resources\ShareResource;
use App\Http\Resources\TodoListResource;
use App\Http\Resources\TodoResource;
use App\Models\Share;
use App\Models\Todo;
use App\Support\Format;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SnapshotController extends Controller
{
    public function __invoke(ApiRequest $r): JsonResponse
    {
        return DB::transaction(function () use ($r) {
            $a = $r->user()->fresh()->load(['user', 'settings']);
            $lists = $a->accessibleLists()->orderBy('created_at')->orderBy('id')->get();
            $todos = Todo::whereIn('todo_list_id', $lists->pluck('id'))->orderBy('created_at')->orderBy('id')->get();
            $shares = $a->registered() ? Share::with(['todoList', 'sharedBy'])->where('email', $a->user->email)->where('status', 'pending')->orderBy('created_at')->orderBy('id')->get() : collect();

            return response()->json(['data' => ['server_time' => Format::time(now()), 'session' => (new SessionResource($a))->resolve($r), 'todo_lists' => TodoListResource::collection($lists)->resolve($r), 'todos' => TodoResource::collection($todos)->resolve($r), 'pending_shares' => ShareResource::collection($shares)->resolve($r)]]);
        });
    }
}
