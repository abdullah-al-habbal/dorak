<?php

declare(strict_types=1);

namespace Modules\Booking\Handlers\Client;

use Illuminate\Support\Facades\DB;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Client\CreateBookingEloquentResolver;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Services\BookingIdempotency;
use Modules\Booking\ValuesObjects\CreateBookingResult;

final class CreateBookingHandler
{
    public function __construct(
        private readonly CreateBookingEloquentResolver $resolver,
        private readonly BookingIdempotency $idempotency,
    ) {}

    public function handle(CreateBookingCommand $command): CreateBookingResult
    {
        /** @var array{0: BookingModel, 1: bool} $outcome */
        $outcome = DB::transaction(function () use ($command): array {
            $replayed = $this->idempotency->replay($command);
            if ($replayed !== null) {
                return [$replayed, true];
            }

            $booking = $this->resolver->resolve($command);
            $this->idempotency->remember($command, $booking);

            return [$booking, false];
        });
        [$booking, $replayed] = $outcome;

        if (! $replayed) {
            SendBookingStatusNotificationJob::dispatch($booking->id, true, app()->getLocale());
        }

        return new CreateBookingResult(booking: $booking, replayed: $replayed);
    }
}
