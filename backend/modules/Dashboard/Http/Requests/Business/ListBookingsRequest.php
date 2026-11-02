<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Booking\Enums\BookingStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListBookingsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'chair_id' => ['nullable', 'uuid'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'booking_status' => ['nullable', Rule::enum(BookingStatus::class)],
            'stylist_id' => ['nullable', 'uuid'],
        ];
    }
}
