<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Http\Resources\TodoListResource;
use App\Models\TodoList;
use App\Support\Access;
use App\Support\ApiError;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TodoListController extends Controller
{
    public function index(ApiRequest $r): AnonymousResourceCollection
    {
        return TodoListResource::collection($r->user()->accessibleLists()->orderBy('created_at')->orderBy('id')->get());
    }

    public function show(ApiRequest $r, string $id): TodoListResource
    {
        $list = Access::list($r->user(), $id);
        $list->load(['todos' => fn ($q) => $q->orderBy('created_at')->orderBy('id')]);

        return new TodoListResource($list);
    }

    public function store(ApiRequest $r): JsonResponse
    {
        $p = $r->payload();
        if (TodoList::find($p['id'])) {
            throw new ApiError('ID_ALREADY_EXISTS', 409);
        }
        $list = TodoList::create($p + ['owner_account_id' => $r->user()->id, 'description' => null, 'icon' => 'droplet', 'color' => '#22C55E']);
        $a = $r->user();
        if (! $a->has_created_list) {
            $a->update(['has_created_list' => true]);
            $a->settings->update(['list_view_layout' => array_merge($a->settings->list_view_layout, [$list->id])]);
        }

        return (new TodoListResource($list))->response()->setStatusCode(201);
    }

    public function update(ApiRequest $r, string $id): TodoListResource
    {
        $list = Access::list($r->user(), $id, true);
        $list->fill($r->payload());
        if ($list->isDirty()) {
            $list->save();
        }

        return new TodoListResource($list);
    }

    public function destroy(ApiRequest $r, string $id): Response
    {
        $list = Access::list($r->user(), $id, true);
        Access::cleanLayout($id);
        $list->delete();

        return response()->noContent();
    }
}
