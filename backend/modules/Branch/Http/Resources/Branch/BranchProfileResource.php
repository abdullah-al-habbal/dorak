<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Resources\Branch;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Branch\Http\Resources\Shared\BranchResource;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;

/**
 * The signed-in branch's own storefront (Task 51): the public branch fields,
 * every locale of the translatable fields for editing, the weekly hours and
 * today's effective hours.
 *
 * @mixin BranchModel
 */
final class BranchProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hours = app(BranchHours::class);

        return [
            ...(new BranchResource($this->resource))->toArray($request),
            'translations' => [
                'name' => $this->getTranslations('name'),
                'description' => $this->getTranslations('description'),
                'address' => $this->getTranslations('address'),
                'tags' => $this->tagTranslations(),
            ],
            'opening_hours' => $hours->week($this->resource),
            'today_hours' => $hours->forDate((string) $this->getKey(), now()),
        ];
    }
}
