<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Booking\Enums\BookingStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateBookingStatusRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['booking_status' => ['required', Rule::enum(BookingStatus::class)]];
    }
}
