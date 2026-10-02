<?php

namespace App\Http\Resources;

use App\Support\Format;
use Illuminate\Http\Resources\Json\JsonResource;

class TodoResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['id' => $this->id, 'todo_list_id' => $this->todo_list_id, 'name' => $this->name, 'description' => $this->description, 'is_done' => $this->is_done, 'deadline' => Format::time($this->deadline), 'version' => $this->version, 'created_at' => Format::time($this->created_at), 'updated_at' => Format::time($this->updated_at)];
    }
}
