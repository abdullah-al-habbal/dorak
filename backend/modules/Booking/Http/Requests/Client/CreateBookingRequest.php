<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Requests\Client;

use Carbon\Carbon;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateBookingRequest extends BaseApiFormRequest
{
    /** The key travels in the `Idempotency-Key` header only; a body field of that name is ignored. */
    protected function prepareForValidation(): void
    {
        $this->merge(['idempotency_key' => $this->header(BookingConstants::BOOKING_IDEMPOTENCY_HEADER)]);
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => [
                'nullable',
                'string',
                'min:'.BookingConstants::BOOKING_IDEMPOTENCY_KEY_MIN_LENGTH,
                'max:'.BookingConstants::BOOKING_IDEMPOTENCY_KEY_MAX_LENGTH,
                'regex:'.BookingConstants::BOOKING_IDEMPOTENCY_KEY_PATTERN,
            ],
            'chair_id' => ['nullable', 'string', 'exists:chairs,id', 'required_without_all:home_address,branch_id', 'prohibits:home_address', 'prohibits:branch_id'],
            'branch_id' => ['nullable', 'string', 'exists:branches,id', 'required_without_all:chair_id,home_address', 'prohibits:home_address'],
            'barber_id' => ['nullable', 'string', 'exists:barbers,id', 'required_with:branch_id'],
            'starts_at' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after:now'],
            'service_ids' => ['required', 'array', 'min:1', ValidationLimitConstants::RULE_LIST_MAX],
            'service_ids.*' => ['string', 'distinct', 'exists:offered_services,id'],
            'home_address' => ['nullable', 'array:latitude,longitude,street,building,unit', 'required_without_all:chair_id,branch_id', 'prohibits:chair_id'],
            'home_address.latitude' => ['required_with:home_address', 'numeric', 'between:-90,90'],
            'home_address.longitude' => ['required_with:home_address', 'numeric', 'between:-180,180'],
            'home_address.street' => ['required_with:home_address', 'string', 'max:255'],
            'home_address.building' => ['required_with:home_address', 'string', 'max:100'],
            'home_address.unit' => ['required_with:home_address', 'string', 'max:100'],
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
            homeAddress: $this->validated('home_address'),
            branchId: is_string($branchId) ? $branchId : null,
            idempotencyKey: $this->validated('idempotency_key'),
        );
    }
}
