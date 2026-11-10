<?php

declare(strict_types=1);

namespace Modules\Admin\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AdminUserResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => $this->deactivated_at === null,
            'deactivated_at' => $this->deactivated_at,
            'created_at' => $this->created_at,
        ];
    }
}
