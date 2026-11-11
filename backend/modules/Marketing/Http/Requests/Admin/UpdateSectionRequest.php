<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Marketing\Constants\MarketingAdminConstants;
use Modules\Marketing\Enums\UniverseVisibilityEnum;
use Modules\Marketing\Models\SectionModel;
use Modules\Marketing\Rules\TrustedMediaUrlRule;

/** Edits a section's content, order and audience. Its page and type are fixed: the Blade templates render by them. */
final class UpdateSectionRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'array:en,ar'],
            'title.en' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'title.ar' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'subtitle' => ['nullable', 'array:en,ar'],
            'subtitle.en' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'subtitle.ar' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'body' => ['required', 'array:en,ar', function (string $attribute, mixed $value, \Closure $fail): void {
                if (strlen((string) json_encode($value)) > MarketingAdminConstants::SECTION_BODY_MAX_BYTES) {
                    $fail(__('validation.max.string', ['attribute' => $attribute, 'max' => MarketingAdminConstants::SECTION_BODY_MAX_BYTES]));
                }
            }],
            'body.en' => ['required', 'array'],
            'body.ar' => ['required', 'array'],
            'media_url' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH, new TrustedMediaUrlRule($this->currentMediaUrl())],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:'.MarketingAdminConstants::SORT_ORDER_MAX],
            'universe_visibility' => ['sometimes', Rule::enum(UniverseVisibilityEnum::class)],
        ];
    }

    private function currentMediaUrl(): ?string
    {
        $section = SectionModel::query()->find($this->route('section'));

        return $section instanceof SectionModel ? $section->media_url : null;
    }
}
