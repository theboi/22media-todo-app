<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Support\Access;
use App\Support\ApiError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TodoController extends Controller
{
    public function index(ApiRequest $r): AnonymousResourceCollection
    {
        $p = $r->validated();
        if (isset($p['todo_list_id'])) {
            Access::list($r->user(), $p['todo_list_id']);
        }
        $q = Todo::whereIn('todo_list_id', $r->user()->accessibleLists()->select('id'));
        if (isset($p['todo_list_id'])) {
            $q->where('todo_list_id', $p['todo_list_id']);
        }
        if (isset($p['is_done'])) {
            $q->where('is_done', $p['is_done'] === 'true');
        }

        return TodoResource::collection($q->orderBy('created_at')->orderBy('id')->get());
    }

    public function show(ApiRequest $r, string $id): TodoResource
    {
        return new TodoResource(Access::todo($r->user(), $id));
    }

    public function store(ApiRequest $r): JsonResponse
    {
        $p = $r->payload();
        Access::list($r->user(), $p['todo_list_id']);
        if (Todo::find($p['id'])) {
            throw new ApiError('ID_ALREADY_EXISTS', 409);
        }

        return (new TodoResource(Todo::create($p + ['description' => null, 'is_done' => false, 'deadline' => null, 'version' => 1, 'completed_at' => ($p['is_done'] ?? false) ? now() : null])))->response()->setStatusCode(201);
    }

    public function update(ApiRequest $r, string $id): TodoResource
    {
        $todo = Access::todo($r->user(), $id);
        $todo->fill($r->payload());
        if ($todo->isDirty('is_done')) {
            $todo->completed_at = $todo->is_done ? now() : null;
        }
        if ($todo->isDirty(['name', 'description', 'is_done', 'deadline'])) {
            $todo->version++;
            $todo->save();
        }

        return new TodoResource($todo);
    }

    public function destroy(ApiRequest $r, string $id): Response
    {
        Access::todo($r->user(), $id)->delete();

        return response()->noContent();
    }
}
