<?php

namespace App\Http\Resources;

use App\Support\Format;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray($request): array
    {
        return ['account' => ['id' => $this->id, 'kind' => $this->registered() ? 'registered' : 'guest', 'user_id' => $this->user_id, 'first_device' => $this->first_device], 'user' => $this->user ? ['id' => $this->user->id, 'email' => $this->user->email, 'email_verified_at' => Format::time($this->user->email_verified_at)] : null, 'settings' => ['list_view_layout' => $this->settings->list_view_layout]];
    }
}
