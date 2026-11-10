<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Brand\Constants\BrandReviewConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SuspendBranchRequest extends BaseApiFormRequest
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
