<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Carbon\Carbon;
use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\CreateWalkInBookingCommand;

final class CreateWalkInBookingRequest extends BaseApiFormRequest
{
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
            'time_slot' => ['required', 'date', 'after:now'],
        ];
    }

    public function toCommand(): CreateWalkInBookingCommand
    {
        return new CreateWalkInBookingCommand(
            branchId: $this->validated('branch_id'),
            chairId: $this->validated('chair_id'),
            barberId: $this->validated('barber_id'),
            clientId: $this->validated('client_id'),
            customerName: $this->validated('customer_name'),
            customerEmail: $this->validated('customer_email'),
            customerPhone: $this->validated('customer_phone'),
            timeSlot: Carbon::parse($this->validated('time_slot')),
            serviceIds: $this->validated('service_ids'),
        );
    }
}
