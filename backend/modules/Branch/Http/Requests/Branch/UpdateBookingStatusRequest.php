<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\Booking\Enums\BookingStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateBookingStatusRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['booking_status' => ['required', Rule::enum(BookingStatus::class)]];
    }
}
