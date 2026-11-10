<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RejectBarberRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:'.BarberReviewConstants::REASON_MIN_LENGTH, 'max:'.BarberReviewConstants::REASON_MAX_LENGTH],
        ];
    }

    public function reason(): string
    {
        return trim((string) $this->validated('reason'));
    }
}
