<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Carbon\CarbonImmutable;
use Illuminate\Validation\Validator;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Constants\WeekdayConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardHoursOverrideConstants;

/**
 * FT-8: one exception applied to every day of a date range, optionally only on some weekdays
 * (a recurring closure such as "every Friday in August"). It expands into dated exceptions.
 */
final class SetBranchHoursOverrideRangeRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'date_from' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.app(BranchTimeZones::class)->today((string) $this->route('branch'))],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'weekdays' => ['sometimes', 'array', 'min:1', 'max:'.WeekdayConstants::WEEKDAY_DAYS_IN_WEEK],
            'weekdays.*' => ['integer', WeekdayConstants::betweenRule(), 'distinct'],
            ...OpeningHoursRules::day(),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $from = $this->input('date_from');
            $to = $this->input('date_to');
            if (! is_string($from) || ! is_string($to) || $validator->errors()->hasAny(['date_from', 'date_to'])) {
                return;
            }
            if (CarbonImmutable::parse($from)->diffInDays(CarbonImmutable::parse($to)) >= DashboardHoursOverrideConstants::MAX_RANGE_DAYS) {
                $validator->errors()->add('date_to', __('dashboard::validation.hours_override_range_too_long', ['days' => DashboardHoursOverrideConstants::MAX_RANGE_DAYS]));
            }
        });
    }

    /** @return list<int>|null */
    public function weekdays(): ?array
    {
        $weekdays = $this->input('weekdays');

        return is_array($weekdays) ? array_map('intval', array_values($weekdays)) : null;
    }
}
