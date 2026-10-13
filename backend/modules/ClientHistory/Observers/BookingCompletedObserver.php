<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Observers;

use Illuminate\Support\Facades\Log;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\ClientHistory\CQRS\Command\CreateClientServiceHistoryCommand;
use Modules\ClientHistory\Handlers\CreateClientServiceHistoryHandler;
use Throwable;

final class BookingCompletedObserver
{
    public bool $afterCommit = true;

    public function __construct(
        private readonly CreateClientServiceHistoryHandler $handler,
    ) {}

    public function updated(BookingModel $booking): void
    {
        if (! $booking->wasChanged('status')) {
            return;
        }

        if ($booking->status !== BookingStatus::Completed) {
            return;
        }

        try {
            $booking->loadMissing(['chair', 'services']);
            $barberId = $booking->barber_id ?? $booking->chair?->barber_id;

            foreach ($booking->services as $service) {
                $this->handler->handle(new CreateClientServiceHistoryCommand(
                    clientId: $booking->client_id,
                    bookingId: $booking->id,
                    barberId: $barberId,
                    branchId: $booking->chair?->branch_id,
                    offeredServiceId: $service->id,
                    catalogItemId: $service->catalog_item_id,
                    performedAt: $booking->time_slot,
                ));
            }
        } catch (Throwable $exception) {
            Log::error('Failed to record completed booking service history.', [
                'booking_id' => $booking->id,
                'exception' => $exception,
            ]);
        }
    }
}
