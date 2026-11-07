<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Resources\Schedule;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Barber\Models\BarberScheduleModel;

/**
 * One weekday row of the barber's weekly hours: the same field names the
 * mobile `/barber/schedule` rows use, without the internal ids.
 *
 * @mixin BarberScheduleModel
 */
final class ScheduleHoursResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'day_of_week' => $this->day_of_week,
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'is_active' => $this->is_active,
        ];
    }
}
