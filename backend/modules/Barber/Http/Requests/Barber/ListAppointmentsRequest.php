<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Barber\Constants\BarberAppointmentConstants;
use Modules\Booking\Enums\BookingStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListAppointmentsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'string', Rule::enum(BookingStatus::class)],
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.BarberAppointmentConstants::BARBER_APPOINTMENTS_MAX_PER_PAGE],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', BarberAppointmentConstants::BARBER_APPOINTMENTS_DEFAULT_PER_PAGE);
    }
}
