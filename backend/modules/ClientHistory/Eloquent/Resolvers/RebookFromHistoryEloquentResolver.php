<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Eloquent\Resolvers;

use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Handlers\Client\CreateBookingHandler;
use Modules\Booking\Models\BookingModel;
use Modules\ClientHistory\CQRS\Command\RebookFromHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class RebookFromHistoryEloquentResolver
{
    public function __construct(
        private readonly CreateBookingHandler $createBookingHandler,
    ) {}

    public function resolve(RebookFromHistoryCommand $command): BookingModel
    {
        $history = ClientServiceHistoryModel::query()
            ->where('client_id', $command->clientId)
            ->with(['booking.services'])
            ->findOrFail($command->historyId);
        $sourceBooking = $history->getRelation('booking');
        $sourceBooking = $sourceBooking instanceof BookingModel ? $sourceBooking : null;
        $serviceIds = $sourceBooking?->services->modelKeys() ?? [];

        $offeredServiceId = $history->getAttribute('offered_service_id');
        if ($serviceIds === [] && is_string($offeredServiceId)) {
            $serviceIds = [$offeredServiceId];
        }

        $chairId = $sourceBooking?->getAttribute('chair_id');
        $barberId = $history->getAttribute('barber_id');
        $atHomeLocation = $sourceBooking?->getAttribute('at_home_location');
        $branchId = $history->getAttribute('branch_id');

        $booking = $this->createBookingHandler->handle(new CreateBookingCommand(
            chairId: is_string($chairId) ? $chairId : null,
            barberId: is_string($barberId) ? $barberId : null,
            clientId: $command->clientId,
            timeSlot: $command->timeSlot,
            serviceIds: $serviceIds,
            atHomeLocation: is_array($atHomeLocation) ? $atHomeLocation : null,
        ))->booking;

        $bookingId = $booking->getKey();
        if (is_string($bookingId)) {
            event(new BookingCreatedEvent($bookingId, is_string($branchId) ? $branchId : '', $command->clientId));
        }

        return $booking;
    }
}
