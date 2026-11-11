<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Marketing\Constants\MarketingAdminConstants;

/** Create (`POST`) and update (`PUT .../{testimonial}`). An author appears once per section. */
final class SaveTestimonialRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $unique = Rule::unique('testimonials', 'author_name')
            ->where(fn ($query) => $query->where('section_id', $this->input('section_id')))
            ->ignore($this->route('testimonial'));

        return [
            'section_id' => ['nullable', 'uuid', Rule::exists('sections', 'id')],
            'author_name' => ['required', 'string', 'max:'.MarketingAdminConstants::AUTHOR_NAME_MAX_LENGTH, $unique],
            'author_title' => ['nullable', 'array:en,ar'],
            'author_title.en' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'author_title.ar' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'body' => ['required', 'array:en,ar'],
            'body.en' => ['required', 'string', 'max:'.MarketingAdminConstants::TESTIMONIAL_BODY_MAX_LENGTH],
            'body.ar' => ['required', 'string', 'max:'.MarketingAdminConstants::TESTIMONIAL_BODY_MAX_LENGTH],
            'avatar_url' => ['nullable', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'rating' => ['required', 'integer', 'between:'.MarketingAdminConstants::RATING_MIN.','.MarketingAdminConstants::RATING_MAX],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:'.MarketingAdminConstants::SORT_ORDER_MAX],
        ];
    }
}
