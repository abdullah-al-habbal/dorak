<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Handlers\Client;

use Modules\ServiceCatalog\CQRS\Command\Client\UpdateCatalogItemCommand;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class UpdateCatalogItemHandler
{
    public function handle(UpdateCatalogItemCommand $command): ServiceCatalogItemModel
    {
        $item = ServiceCatalogItemModel::findOrFail($command->id);

        $data = array_filter([
            'category_id' => $command->categoryId,
            'name' => $command->name,
            'description' => $command->description,
            'slug' => $command->slug,
            'sku' => $command->sku,
            'price_range' => $command->priceRange,
            'maintenance_level' => $command->maintenanceLevel,
            'style_period_type' => $command->stylePeriodType,
            'formality_level' => $command->formalityLevel,
            'face_shapes' => $command->faceShapes,
            'hair_textures' => $command->hairTextures,
            'styling_details' => $command->stylingDetails,
            'is_active' => $command->isActive,
            'default_duration_minutes' => $command->defaultDurationMinutes,
        ], fn ($v) => $v !== null);

        $item->update($data);

        if ($command->tagIds !== null) {
            $item->tags()->sync($command->tagIds);
        }

        return $item->fresh();
    }
}
