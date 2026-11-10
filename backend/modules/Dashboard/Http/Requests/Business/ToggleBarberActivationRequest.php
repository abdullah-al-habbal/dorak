<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ToggleBarberActivationRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'min:'.BarberReviewConstants::REASON_MIN_LENGTH, 'max:'.BarberReviewConstants::REASON_MAX_LENGTH],
        ];
    }

    public function reason(): ?string
    {
        $reason = trim($this->string('reason')->toString());

        return $reason === '' ? null : $reason;
    }
}
