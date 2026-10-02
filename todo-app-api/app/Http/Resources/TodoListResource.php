<?php

namespace App\Http\Resources;

use App\Support\Format;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoListResource extends JsonResource
{
    public function toArray($request): array
    {
        $data = ['id' => $this->id, 'name' => $this->name, 'description' => $this->description, 'icon' => $this->icon, 'color' => $this->color, 'owner_account_id' => $this->owner_account_id, 'role' => $this->owner_account_id === $request->user()->id ? 'owner' : 'member', 'created_at' => Format::time($this->created_at), 'updated_at' => Format::time($this->updated_at)];
        if ($this->relationLoaded('todos')) {
            $data['todos'] = TodoResource::collection($this->todos)->resolve($request);
        }

return $data;
    }
}
