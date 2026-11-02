<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Bookings;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Client\CreateBookingEloquentResolver;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\CreateWalkInBookingCommand;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\WalkInBookingScopeResolver;

final readonly class CreateWalkInBookingHandler
{
    public function __construct(
        private CreateBookingEloquentResolver $bookingResolver,
        private WalkInBookingScopeResolver $scopeResolver,
    ) {}

    public function handle(CreateWalkInBookingCommand $command): BookingModel
    {
        return DB::transaction(function () use ($command): BookingModel {
            $this->scopeResolver->ensureResourcesBelongToBranch($command);
            $client = $this->findOrCreateClient($command);

            return $this->bookingResolver->resolve(new CreateBookingCommand(
                chairId: $command->chairId,
                barberId: $command->barberId,
                clientId: $client->id,
                startsAt: $command->startsAt,
                serviceIds: $command->serviceIds,
                atHomeLocation: null,
            ));
        });
    }

    private function findOrCreateClient(CreateWalkInBookingCommand $command): ClientModel
    {
        if ($command->clientId !== null) {
            return ClientModel::query()->findOrFail($command->clientId);
        }

        return ClientModel::query()->firstOrCreate(
            ['email' => $command->customerEmail],
            [
                'name' => ['ar' => $command->customerName, 'en' => $command->customerName],
                'password' => Str::password(32),
                'phone' => $command->customerPhone,
            ],
        );
    }
}
