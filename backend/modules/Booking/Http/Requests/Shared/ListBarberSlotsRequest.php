<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Requests\Shared;

use Carbon\Carbon;
use Illuminate\Validation\Rule;
use Modules\Booking\CQRS\Query\Shared\ListSlotsQuery;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListBarberSlotsRequest extends BaseApiFormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => [
                'string',
                'distinct',
                Rule::exists('offered_services', 'id')->where('active', true),
            ],
        ];
    }

    public function toQuery(string $barberId): ListSlotsQuery
    {
        return new ListSlotsQuery(
            date: Carbon::parse($this->string('date')->toString())->utc(),
            serviceIds: $this->stringList('service_ids'),
            barberId: $barberId,
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
}
