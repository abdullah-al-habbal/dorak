<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
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
use Modules\Branch\Services\BranchTimeZones;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class CreateBookingEloquentResolver
{
    public function __construct(
        private readonly BranchHours $branchHours,
        private readonly EffectiveServiceTerms $serviceTerms,
        private readonly BranchTimeZones $zones,
    ) {}

    public function resolve(CreateBookingCommand $command): BookingModel
    {
        $client = ClientModel::query()->lockForUpdate()->findOrFail($command->clientId);

        if ($client->isBanned()) {
            throw new ActiveBookingBanException;
        }

        $chair = $this->lockChairMatchingBarber($command);
        $barberId = $command->barberId ?? $this->stringOrNull($chair?->getAttribute('barber_id'));
        $branchId = $this->stringOrNull($chair?->getAttribute('branch_id') ?? $command->branchId);

        if ($chair === null && $branchId !== null) {
            $this->ensureBarberAffiliatedWithBranch($barberId, $branchId);
        }

        $services = $this->lockActiveServices($command->serviceIds);
        $this->ensureHomeAddressRules($command, $barberId, $services);

        $endsAt = $command->startsAt->copy()->addMinutes($this->totalDuration($services, $branchId, $barberId));

        $this->ensureBranchDiscoverable($branchId);

        if ($chair !== null) {
            $this->ensureChairBookable($chair, $command->startsAt, $endsAt);
        }

        if (! $this->branchHours->covers($branchId, $command->startsAt, $endsAt)) {
            throw new BookingOutsideScheduleException;
        }

        if ($barberId !== null) {
            $this->ensureBarberBookable($barberId, $command->startsAt, $endsAt, $this->zones->for($branchId));
        }

        return $this->persist($command, $barberId, $branchId, $endsAt);
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) ? $value : null;
    }

    private function ensureBranchDiscoverable(?string $branchId): void
    {
        if ($branchId !== null && ! BranchModel::query()->discoverable()->whereKey($branchId)->exists()) {
            throw new NonDiscoverableBookingEntityException;
        }
    }

    private function lockChairMatchingBarber(CreateBookingCommand $command): ?ChairModel
    {
        if ($command->chairId === null) {
            return null;
        }

        $chair = ChairModel::query()->lockForUpdate()->findOrFail($command->chairId);
        $chairBarberId = $chair->getAttribute('barber_id');

        if (is_string($chairBarberId) && $command->barberId !== null && $command->barberId !== $chairBarberId) {
            throw new InvalidBookingServicesException('booking::messages.barber_chair_mismatch');
        }

        return $chair;
    }

    /**
     * @param  list<string>  $serviceIds
     * @return Collection<int, OfferedServiceModel>
     */
    private function lockActiveServices(array $serviceIds): Collection
    {
        $services = OfferedServiceModel::query()
            ->whereIn('id', $serviceIds)
            ->where('is_active', true)
            ->lockForUpdate()
            ->get();

        if ($services->count() !== count($serviceIds)) {
            throw new InvalidBookingServicesException;
        }

        // One booking has one price and one commission base, so its services share a currency (BG-11).
        if ($services->pluck('currency_code')->unique()->count() > 1) {
            throw new InvalidBookingServicesException('booking::messages.mixed_currency_services');
        }

        return $services;
    }

    /**
     * @param  Collection<int, OfferedServiceModel>  $services
     */
    private function ensureHomeAddressRules(CreateBookingCommand $command, ?string $barberId, Collection $services): void
    {
        if ($command->homeAddress === null) {
            return;
        }

        AtHomeBookingRules::ensure(
            $barberId,
            $services,
            $this->coordinate($command->homeAddress['latitude'] ?? null),
            $this->coordinate($command->homeAddress['longitude'] ?? null),
        );
    }

    /**
     * @param  Collection<int, OfferedServiceModel>  $services
     */
    private function totalDuration(Collection $services, ?string $branchId, ?string $barberId): int
    {
        $this->serviceTerms->attach($services, $this->serviceTerms->brandIdForBranch($branchId));
        $totalDuration = 0;

        foreach ($services as $service) {
            $duration = $service->effectiveDurationMinutes();

            if (! is_int($duration) || $duration < 1) {
                throw new InvalidBookingServicesException;
            }

            if (! $this->isOwnedByBookingScope($service, $branchId, $barberId)) {
                throw new InvalidBookingServicesException;
            }

            $totalDuration += $duration;
        }

        return $totalDuration;
    }

    private function ensureChairBookable(ChairModel $chair, Carbon $startsAt, Carbon $endsAt): void
    {
        if (! $chair->currentAvailability()->isBookable()) {
            throw new ChairNotAvailableException;
        }

        $this->ensureNoOverlap('chair_id', (string) $chair->getKey(), $startsAt, $endsAt);
    }

    private function ensureBarberBookable(string $barberId, Carbon $startsAt, Carbon $endsAt, string $timeZone): void
    {
        $barber = BarberModel::query()->lockForUpdate()->findOrFail($barberId);

        if ($barber->isBanned()) {
            throw new ActiveBookingBanException;
        }

        if ($barber->getAttribute('status') !== BarberStatusEnum::Enabled) {
            throw new NonDiscoverableBookingEntityException;
        }

        if (! BarberScheduleAvailability::covers($barberId, $startsAt, $endsAt, $timeZone)) {
            throw new BookingOutsideScheduleException;
        }

        $this->ensureNoOverlap('barber_id', $barberId, $startsAt, $endsAt);
    }

    private function persist(CreateBookingCommand $command, ?string $barberId, ?string $branchId, Carbon $endsAt): BookingModel
    {
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
            ServiceableTypeEnum::Brand => $branchId !== null && $ownerId === $this->serviceTerms->brandIdForBranch($branchId),
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
