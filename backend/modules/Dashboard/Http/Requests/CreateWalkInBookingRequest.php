<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Carbon\Carbon;
use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\CreateWalkInBookingCommand;

final class CreateWalkInBookingRequest extends BaseApiFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'barber_id' => ['nullable', 'uuid', Rule::exists('barbers', 'id')],
            'branch_id' => ['required', 'uuid', Rule::exists('branches', 'id')],
            'chair_id' => ['required', 'uuid', Rule::exists('chairs', 'id')],
            'client_id' => ['nullable', 'uuid', Rule::exists('clients', 'id')],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['uuid', 'distinct', Rule::exists('offered_services', 'id')],
            'time_slot' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after:now'],
        ];
    }

    public function toCommand(): CreateWalkInBookingCommand
    {
        $barberId = $this->validated('barber_id');
        $clientId = $this->validated('client_id');
        $customerPhone = $this->validated('customer_phone');

        return new CreateWalkInBookingCommand(
            branchId: $this->string('branch_id')->toString(),
            chairId: $this->string('chair_id')->toString(),
            barberId: is_string($barberId) ? $barberId : null,
            clientId: is_string($clientId) ? $clientId : null,
            customerName: $this->string('customer_name')->toString(),
            customerEmail: $this->string('customer_email')->toString(),
            customerPhone: is_string($customerPhone) ? $customerPhone : null,
            timeSlot: Carbon::parse($this->string('time_slot')->toString())->utc(),
            serviceIds: $this->array('service_ids'),
        );
    }
}
