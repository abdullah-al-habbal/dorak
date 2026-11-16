<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\ServiceCatalog\CQRS\Command\Client\UpdateCatalogItemCommand;
use Modules\ServiceCatalog\Enums\FaceShapeEnum;
use Modules\ServiceCatalog\Enums\FormalityEnum;
use Modules\ServiceCatalog\Enums\HairTextureEnum;
use Modules\ServiceCatalog\Enums\MaintenanceLevelEnum;
use Modules\ServiceCatalog\Enums\StylePeriodEnum;

final class UpdateCatalogItemRequest extends BaseApiFormRequest
{
    /** The optional columns an admin may empty again by sending null (FT-12). */
    private const array CLEARABLE_COLUMNS = ['sku', 'price_range', 'maintenance_level', 'style_period_type', 'formality_level', 'default_duration_minutes', 'styling_details'];

    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'category_id' => ['sometimes', 'uuid', Rule::exists('service_catalog_categories', 'id')->whereNull('deleted_at')],
            'name.en' => ['sometimes', 'string', 'max:255'],
            'name.ar' => ['sometimes', 'string', 'max:255'],
            'description.en' => ['nullable', 'string', 'max:5000'],
            'description.ar' => ['nullable', 'string', 'max:5000'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('service_catalog_items', 'slug')->ignore($id)],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('service_catalog_items', 'sku')->ignore($id)],
            'price_range' => ['sometimes', 'nullable', 'array:min,max,currency'],
            'price_range.min' => ['required_with:price_range', 'numeric', 'min:0', 'max:'.ValidationLimitConstants::VALIDATION_PRICE_MINOR_MAX],
            'price_range.max' => ['required_with:price_range', 'numeric', 'min:0', 'gte:price_range.min', 'max:'.ValidationLimitConstants::VALIDATION_PRICE_MINOR_MAX],
            'price_range.currency' => ['required_with:price_range', 'string', 'size:3'],
            'maintenance_level' => ['nullable', Rule::enum(MaintenanceLevelEnum::class)],
            'style_period_type' => ['nullable', Rule::enum(StylePeriodEnum::class)],
            'formality_level' => ['nullable', Rule::enum(FormalityEnum::class)],
            'face_shapes' => ['sometimes', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'face_shapes.*' => [Rule::enum(FaceShapeEnum::class)],
            'hair_textures' => ['sometimes', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'hair_textures.*' => [Rule::enum(HairTextureEnum::class)],
            'styling_details' => ['nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'is_active' => ['sometimes', 'boolean'],
            'default_duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'tag_ids' => ['sometimes', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'tag_ids.*' => ['uuid', 'exists:service_catalog_item_tags,id'],
        ];
    }

    /**
     * Columns the client sent as an explicit null; a missing key leaves the column alone.
     *
     * @param  array<string, mixed>  $data
     * @return list<string>
     */
    private function clearedColumns(array $data): array
    {
        return array_values(array_filter(
            self::CLEARABLE_COLUMNS,
            static fn (string $column): bool => array_key_exists($column, $data) && $data[$column] === null,
        ));
    }

    public function toCommand(string $id): UpdateCatalogItemCommand
    {
        $data = $this->validated();

        return new UpdateCatalogItemCommand(
            id: $id,
            categoryId: isset($data['category_id']) ? $this->string('category_id')->toString() : null,
            name: $data['name'] ?? null,
            description: $data['description'] ?? null,
            slug: $data['slug'] ?? null,
            sku: $data['sku'] ?? null,
            priceRange: $data['price_range'] ?? null,
            maintenanceLevel: isset($data['maintenance_level']) ? MaintenanceLevelEnum::from($data['maintenance_level']) : null,
            stylePeriodType: isset($data['style_period_type']) ? StylePeriodEnum::from($data['style_period_type']) : null,
            formalityLevel: isset($data['formality_level']) ? FormalityEnum::from($data['formality_level']) : null,
            faceShapes: $data['face_shapes'] ?? null,
            hairTextures: $data['hair_textures'] ?? null,
            stylingDetails: $data['styling_details'] ?? null,
            isActive: $data['is_active'] ?? null,
            defaultDurationMinutes: $data['default_duration_minutes'] ?? null,
            tagIds: $data['tag_ids'] ?? null,
            clear: $this->clearedColumns($data),
        );
    }
}
