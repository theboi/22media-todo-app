<?php

namespace App\Http\Resources;

use App\Support\Format;
use Illuminate\Http\Resources\Json\JsonResource;

class ShareResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['id' => $this->id, 'todo_list_id' => $this->todo_list_id, 'todo_list_name' => $this->todoList->name, 'email' => $this->email, 'shared_by' => ['user_id' => $this->sharedBy->id, 'email' => $this->sharedBy->email], 'status' => $this->status, 'created_at' => Format::time($this->created_at), 'updated_at' => Format::time($this->updated_at)];
    }
}
