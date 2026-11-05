<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Shared;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** The slim category payload the service form selects from. */
final class DashboardServiceCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->getTranslations('name'),
        ];
    }
}
