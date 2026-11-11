<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Marketing\Constants\MarketingAdminConstants;

/** Edits a page's titles and meta descriptions. The slug is fixed: the public site routes by it. */
final class UpdateMarketingPageRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'array:en,ar'],
            'title.en' => ['required', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'title.ar' => ['required', 'string', 'max:'.MarketingAdminConstants::TEXT_MAX_LENGTH],
            'meta_description' => ['nullable', 'array:en,ar'],
            'meta_description.en' => ['nullable', 'string', 'max:'.MarketingAdminConstants::META_MAX_LENGTH],
            'meta_description.ar' => ['nullable', 'string', 'max:'.MarketingAdminConstants::META_MAX_LENGTH],
        ];
    }
}
