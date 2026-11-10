<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Requests\Admin;

use Modules\Brand\Constants\BrandReviewConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RejectBrandRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:'.BrandReviewConstants::BRAND_REASON_MIN_LENGTH, 'max:'.BrandReviewConstants::BRAND_REASON_MAX_LENGTH],
        ];
    }

    public function reason(): string
    {
        return trim((string) $this->validated('reason'));
    }
}
