<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Client\Enums\UniverseEnum;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Explore\CQRS\Query\Shared\ExploreBarbersQuery;
use Modules\Explore\CQRS\Query\Shared\ExploreBranchesQuery;
use Modules\Explore\CQRS\Query\Shared\ExploreSearchQuery;
use Modules\Explore\Support\ExploreUniverse;

final class ExploreSearchRequest extends BaseApiFormRequest
{
    use AppliesDiscoveryPreferences;

    public function rules(): array
    {
        return [
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'radius' => ['required', 'numeric', ValidationLimitConstants::RULE_RADIUS_KM],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'universe' => ['sometimes', 'nullable', Rule::enum(UniverseEnum::class)],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tag_ids' => ['sometimes', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'tag_ids.*' => ['uuid', 'exists:service_catalog_item_tags,id'],
            'catalog_item_ids' => ['sometimes', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'catalog_item_ids.*' => ['uuid', 'exists:service_catalog_items,id'],
            'available_now' => ['sometimes', 'boolean'],
            'price_range' => ['sometimes', 'array:min,max'],
            'price_range.min' => ['integer', ValidationLimitConstants::RULE_PRICE_MINOR],
            'price_range.max' => ['integer', ValidationLimitConstants::RULE_PRICE_MINOR],
            'rating_min' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'face_shape_compatible' => ['sometimes', 'string', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
        ];
    }

    public function toQuery(): ExploreSearchQuery
    {
        $priceRange = $this->validated('price_range');
        $text = $this->validated('q');
        $shared = [
            'latitude' => (float) $this->validated('latitude'),
            'longitude' => (float) $this->validated('longitude'),
            'radius' => (float) $this->validated('radius'),
            'perPage' => (int) ($this->validated('per_page') ?? 20),
            'catalogItemIds' => $this->validated('catalog_item_ids'),
            'availableNow' => $this->availableNowWithPreferences(),
            'priceRangeMin' => isset($priceRange['min']) ? (int) $priceRange['min'] : null,
            'priceRangeMax' => isset($priceRange['max']) ? (int) $priceRange['max'] : null,
            'ratingMin' => $this->validated('rating_min') !== null ? (float) $this->validated('rating_min') : null,
            'search' => is_string($text) && trim($text) !== '' ? trim($text) : null,
            'tagIds' => $this->validated('tag_ids'),
            'universe' => ExploreUniverse::resolve($this->validated('universe'), $this->user('client')),
            'faceShapeCompatible' => $this->validated('face_shape_compatible'),
            'clientId' => $this->user('client')?->getKey(),
        ];

        return new ExploreSearchQuery(
            branches: new ExploreBranchesQuery(...$shared, hiddenBrandIds: $this->discoveryPreferences()->hiddenBrandIds),
            barbers: new ExploreBarbersQuery(...$shared),
            page: (int) ($this->validated('page') ?? 1),
            perPage: $shared['perPage'],
        );
    }
}
