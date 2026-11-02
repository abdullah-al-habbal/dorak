<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Requests\Client;

use Carbon\Carbon;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateBookingRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'chair_id' => ['nullable', 'string', 'exists:chairs,id', 'required_without_all:at_home_location,branch_id', 'prohibits:at_home_location', 'prohibits:branch_id'],
            'branch_id' => ['nullable', 'string', 'exists:branches,id', 'required_without_all:chair_id,at_home_location', 'prohibits:at_home_location'],
            'barber_id' => ['nullable', 'string', 'exists:barbers,id', 'required_with:branch_id'],
            'starts_at' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after:now'],
            'service_ids' => ['required', 'array', 'min:1'],
            'service_ids.*' => ['string', 'distinct', 'exists:offered_services,id'],
            'at_home_location' => ['nullable', 'array', 'required_without_all:chair_id,branch_id', 'prohibits:chair_id'],
            'at_home_location.latitude' => ['required_with:at_home_location', 'numeric', 'between:-90,90'],
            'at_home_location.longitude' => ['required_with:at_home_location', 'numeric', 'between:-180,180'],
            'at_home_location.street' => ['required_with:at_home_location', 'string', 'max:255'],
            'at_home_location.building' => ['required_with:at_home_location', 'string', 'max:100'],
            'at_home_location.unit' => ['required_with:at_home_location', 'string', 'max:100'],
            'payment_method' => ['prohibited'],
            'payment_status' => ['prohibited'],
            'payment_intent' => ['prohibited'],
            'gateway_token' => ['prohibited'],
        ];
    }

    public function toCommand(): CreateBookingCommand
    {
        $branchId = $this->validated('branch_id');

        return new CreateBookingCommand(
            chairId: $this->validated('chair_id'),
            barberId: $this->validated('barber_id'),
            clientId: $this->user()->id,
            startsAt: Carbon::parse($this->validated('starts_at'))->utc(),
            serviceIds: $this->validated('service_ids'),
            atHomeLocation: $this->validated('at_home_location'),
            branchId: is_string($branchId) ? $branchId : null,
        );
    }
}
