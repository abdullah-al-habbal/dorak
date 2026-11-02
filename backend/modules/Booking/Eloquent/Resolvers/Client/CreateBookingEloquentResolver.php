<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\CQRS\Command\Client\CreateBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\BarberNotAffiliatedException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Eloquent\Resolvers\Shared\NonDiscoverableBookingEntityException;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\AtHomeBookingRules;
use Modules\Booking\Queries\BarberScheduleAvailability;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

final class CreateBookingEloquentResolver
{
    public function __construct(private readonly BranchHours $branchHours) {}

    public function resolve(CreateBookingCommand $command): BookingModel
    {
        $client = ClientModel::query()->lockForUpdate()->findOrFail($command->clientId);

        if ($client->isBanned()) {
            throw new ActiveBookingBanException;
        }

        $chair = $command->chairId !== null
            ? ChairModel::query()->lockForUpdate()->findOrFail($command->chairId)
            : null;

        $chairBarberId = $chair?->getAttribute('barber_id');
        $chairBarberId = is_string($chairBarberId) ? $chairBarberId : null;

        if ($chairBarberId !== null && $command->barberId !== null && $command->barberId !== $chairBarberId) {
            throw new InvalidBookingServicesException('booking::messages.barber_chair_mismatch');
        }

        $barberId = $command->barberId ?? $chairBarberId;

        $branchId = $chair?->getAttribute('branch_id') ?? $command->branchId;
        $branchId = is_string($branchId) ? $branchId : null;

        if ($chair === null && $branchId !== null) {
            $this->ensureBarberAffiliatedWithBranch($barberId, $branchId);
        }

        $services = OfferedServiceModel::query()
            ->whereIn('id', $command->serviceIds)
            ->where('is_active', true)
            ->lockForUpdate()
            ->get();

        if ($services->count() !== count($command->serviceIds)) {
            throw new InvalidBookingServicesException;
        }

        if ($command->homeAddress !== null) {
            AtHomeBookingRules::ensure(
                $barberId,
                $services,
                $this->coordinate($command->homeAddress['latitude'] ?? null),
                $this->coordinate($command->homeAddress['longitude'] ?? null),
            );
        }

        $totalDuration = 0;

        foreach ($services as $service) {
            $duration = $service->getAttribute('duration_minutes');

            if (! is_int($duration) || $duration < 1) {
                throw new InvalidBookingServicesException;
            }

            if (! $this->isOwnedByBookingScope($service, $branchId, $barberId)) {
                throw new InvalidBookingServicesException;
            }

            $totalDuration += $duration;
        }

        $endsAt = $command->startsAt->copy()->addMinutes($totalDuration);

        if ($branchId !== null) {
            if (! BranchModel::query()->discoverable()->whereKey($branchId)->exists()) {
                throw new NonDiscoverableBookingEntityException;
            }
        }

        if ($chair !== null) {

            if (! $chair->currentAvailability()->isBookable()) {
                throw new ChairNotAvailableException;
            }

            $this->ensureNoOverlap('chair_id', $command->chairId, $command->startsAt, $endsAt);
        }

        if (! $this->branchHours->covers($branchId, $command->startsAt, $endsAt)) {
            throw new BookingOutsideScheduleException;
        }

        if ($barberId !== null) {
            $barber = BarberModel::query()->lockForUpdate()->findOrFail($barberId);

            if ($barber->isBanned()) {
                throw new ActiveBookingBanException;
            }
            if ($barber->getAttribute('status') !== BarberStatusEnum::Enabled) {
                throw new NonDiscoverableBookingEntityException;
            }

            if (! BarberScheduleAvailability::covers($barberId, $command->startsAt, $endsAt)) {
                throw new BookingOutsideScheduleException;
            }

            $this->ensureNoOverlap('barber_id', $barberId, $command->startsAt, $endsAt);
        }

        $bookingData = [
            'client_id' => $command->clientId,
            'barber_id' => $barberId,
            'branch_id' => $branchId,
            'starts_at' => $command->startsAt,
            'ends_at' => $endsAt,
            'booking_status' => BookingStatus::Pending,
            'payment_method' => BookingPaymentMethod::PayAtSalon,
            'payment_status' => BookingPaymentStatus::UnpaidInPerson,
        ];

        if ($command->chairId !== null) {
            $bookingData['chair_id'] = $command->chairId;
        }

        if ($command->homeAddress !== null) {
            $bookingData['home_address'] = $command->homeAddress;
        }

        $booking = BookingModel::create($bookingData);

        $booking->services()->attach($command->serviceIds);

        $booking->load(['chair.barber', 'barber', 'services']);

        return $booking;
    }

    private function coordinate(mixed $value): float
    {
        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function ensureBarberAffiliatedWithBranch(?string $barberId, string $branchId): void
    {
        $brandId = BranchModel::query()->whereKey($branchId)->value('brand_id');

        $affiliated = $barberId !== null && BarberAffiliationModel::query()
            ->where('barber_id', $barberId)
            ->where('status', AffiliationStatus::Active)
            ->where(function ($query) use ($branchId, $brandId): void {
                $query->where(fn ($branch) => $branch->where('affiliable_type', AffiliableType::Branch)->where('affiliable_id', $branchId))
                    ->orWhere(fn ($brand) => $brand->where('affiliable_type', AffiliableType::Brand)->where('affiliable_id', $brandId));
            })
            ->exists();

        if (! $affiliated) {
            throw new BarberNotAffiliatedException;
        }
    }

    private function isOwnedByBookingScope(OfferedServiceModel $service, ?string $branchId, ?string $barberId): bool
    {
        $ownerId = $service->getAttribute('serviceable_id');

        return match ($service->getAttribute('serviceable_type')) {
            ServiceableTypeEnum::Barber => $barberId !== null && $ownerId === $barberId,
            ServiceableTypeEnum::Brand => $branchId !== null && $ownerId === BranchModel::query()->whereKey($branchId)->value('brand_id'),
            default => false,
        };
    }

    private function ensureNoOverlap(string $column, string $resourceId, Carbon $startsAt, Carbon $endsAt): void
    {
        $query = BookingModel::query()->where($column, $resourceId);
        BookingAvailability::apply($query, $startsAt, $endsAt);
        $conflict = $query->lockForUpdate()->exists();

        if ($conflict) {
            throw new DoubleBookingException;
        }
    }
}
