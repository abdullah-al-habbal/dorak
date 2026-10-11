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
        $serviceIds = $history->booking?->services->pluck('id')->all() ?? [];

        if ($serviceIds === [] && $history->offered_service_id !== null) {
            $serviceIds = [$history->offered_service_id];
        }

        $booking = $this->createBookingHandler->handle(new CreateBookingCommand(
            chairId: $history->booking?->chair_id,
            barberId: $history->barber_id,
            clientId: $command->clientId,
            timeSlot: $command->timeSlot,
            serviceIds: $serviceIds,
            atHomeLocation: $history->booking?->at_home_location,
        ))->booking;

        if ($history->branch_id !== null) {
            event(new BookingCreatedEvent($booking->id, (string) $history->branch_id));
        }

        return $booking;
    }
}
