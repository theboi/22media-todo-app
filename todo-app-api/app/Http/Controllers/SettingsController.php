<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApiRequest;
use App\Support\ApiError;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function show(ApiRequest $r): JsonResponse
    {
        return response()->json(['data' => ['list_view_layout' => $r->user()->settings->list_view_layout]]);
    }

    public function update(ApiRequest $r): JsonResponse
    {
        $ids = $r->validated('list_view_layout');
        if ($r->user()->accessibleLists()->whereIn('id', $ids)->count() !== count($ids)) {
            throw new ApiError('VALIDATION_FAILED', 422, ['list_view_layout' => ['Every list must be accessible.']]);
        }
        $r->user()->settings->update($r->payload());

        return $this->show($r);
    }
}
