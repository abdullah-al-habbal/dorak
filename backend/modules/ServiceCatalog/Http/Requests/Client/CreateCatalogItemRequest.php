<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\CQRS\Command\Client\CreateCatalogItemCommand;
use Modules\ServiceCatalog\Enums\FaceShapeEnum;
use Modules\ServiceCatalog\Enums\FormalityEnum;
use Modules\ServiceCatalog\Enums\HairTextureEnum;
use Modules\ServiceCatalog\Enums\MaintenanceLevelEnum;
use Modules\ServiceCatalog\Enums\StylePeriodEnum;

final class CreateCatalogItemRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'uuid', Rule::exists('service_catalog_categories', 'id')->whereNull('deleted_at')],
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'description.en' => ['nullable', 'string', 'max:5000'],
            'description.ar' => ['nullable', 'string', 'max:5000'],
            'slug' => ['required', 'string', 'max:255', 'unique:service_catalog_items,slug'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:service_catalog_items,sku'],
            'price_range' => ['nullable', 'array:min,max,currency'],
            'price_range.min' => ['required_with:price_range', 'numeric', 'min:0', 'max:'.ValidationLimitConstants::VALIDATION_PRICE_MINOR_MAX],
            'price_range.max' => ['required_with:price_range', 'numeric', 'min:0', 'gte:price_range.min', 'max:'.ValidationLimitConstants::VALIDATION_PRICE_MINOR_MAX],
            'price_range.currency' => ['required_with:price_range', 'string', 'size:3'],
            'maintenance_level' => ['nullable', Rule::enum(MaintenanceLevelEnum::class)],
            'style_period_type' => ['nullable', Rule::enum(StylePeriodEnum::class)],
            'formality_level' => ['nullable', Rule::enum(FormalityEnum::class)],
            'face_shapes' => ['nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'face_shapes.*' => [Rule::enum(FaceShapeEnum::class)],
            'hair_textures' => ['nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'hair_textures.*' => [Rule::enum(HairTextureEnum::class)],
            'styling_details' => ['nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'is_active' => ['required', 'boolean'],
            'default_duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'tag_ids' => ['nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'tag_ids.*' => ['uuid', 'exists:service_catalog_item_tags,id'],
        ];
    }

    public function toCommand(): CreateCatalogItemCommand
    {
        $data = $this->validated();

        return new CreateCatalogItemCommand(
            categoryId: $this->string('category_id')->toString(),
            name: $data['name'],
            description: $data['description'] ?? null,
            slug: $data['slug'],
            sku: $data['sku'] ?? null,
            priceRange: $data['price_range'] ?? null,
            maintenanceLevel: isset($data['maintenance_level']) ? MaintenanceLevelEnum::from($data['maintenance_level']) : null,
            stylePeriodType: isset($data['style_period_type']) ? StylePeriodEnum::from($data['style_period_type']) : null,
            formalityLevel: isset($data['formality_level']) ? FormalityEnum::from($data['formality_level']) : null,
            faceShapes: $data['face_shapes'] ?? null,
            hairTextures: $data['hair_textures'] ?? null,
            stylingDetails: $data['styling_details'] ?? null,
            isActive: (bool) $data['is_active'],
            defaultDurationMinutes: $data['default_duration_minutes'] ?? null,
            tagIds: $data['tag_ids'] ?? null,
        );
    }
}
