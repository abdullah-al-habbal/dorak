<?php

declare(strict_types=1);

namespace Modules\Language\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Language\Models\LanguageModel;

/** @mixin LanguageModel */
final class AdminLanguageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'text_direction' => $this->text_direction->value,
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
        ];
    }
}
