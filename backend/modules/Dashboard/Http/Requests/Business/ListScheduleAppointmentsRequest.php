<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Booking\Enums\BookingStatus;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardScheduleConstants;

final class ListScheduleAppointmentsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $dateFormat = 'date_format:'.DashboardScheduleConstants::DASHBOARD_SCHEDULE_DATE_FORMAT;

        return [
            'booking_status' => ['nullable', 'string', Rule::enum(BookingStatus::class)],
            'date_from' => ['nullable', $dateFormat],
            'date_to' => ['nullable', $dateFormat, 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:'.DashboardScheduleConstants::DASHBOARD_SCHEDULE_MAX_PER_PAGE],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', DashboardScheduleConstants::DASHBOARD_SCHEDULE_DEFAULT_PER_PAGE);
    }
}
