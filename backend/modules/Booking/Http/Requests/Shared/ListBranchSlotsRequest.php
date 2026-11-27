<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Requests\Shared;

use Carbon\Carbon;
use Illuminate\Validation\Rule;
use Modules\Booking\CQRS\Query\Shared\ListSlotsQuery;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListBranchSlotsRequest extends BaseApiFormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'service_ids' => ['required', 'array', 'min:1', ValidationLimitConstants::RULE_LIST_MAX],
            'service_ids.*' => [
                'string',
                'distinct',
                Rule::exists('offered_services', 'id')->where('is_active', true),
            ],
            'chair_id' => ['nullable', 'string', 'exists:chairs,id', 'required_without:barber_id'],
            'barber_id' => ['nullable', 'string', 'exists:barbers,id', 'required_without:chair_id'],
        ];
    }

    public function toQuery(string $branchId): ListSlotsQuery
    {
        return new ListSlotsQuery(
            // A calendar date; the slot resolver reads it in the branch's zone.
            date: Carbon::parse($this->string('date')->toString(), 'UTC'),
            serviceIds: $this->stringList('service_ids'),
            branchId: $branchId,
            chairId: $this->nullableString('chair_id'),
            barberId: $this->nullableString('barber_id'),
        );
    }

    /**
     * @return list<string>
     */
    private function stringList(string $key): array
    {
        $result = [];

        foreach ((array) $this->validated($key) as $value) {
            if (is_string($value)) {
                $result[] = $value;
            }
        }

        return $result;
    }

    private function nullableString(string $key): ?string
    {
        $value = $this->validated($key);

        return is_string($value) ? $value : null;
    }
}
