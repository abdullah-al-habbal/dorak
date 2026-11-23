<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Barber\Enums\BarberAccountDeletionOutcome;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Services\DeviceTokenService;

/**
 * The only way a barber deletes their own account. Barbers have no soft delete and
 * bookings, reviews and client history point at the row, so the account is anonymised
 * in place: every personal field and file is removed, the status becomes disabled
 * (never discoverable, never able to sign in) and the row stays for those records.
 * The linked client account (`client_id`) is a separate account and is not touched.
 */
final class BarberAccountDeletion
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function delete(BarberModel $barber): BarberAccountDeletionOutcome
    {
        $files = [];

        $outcome = DB::transaction(function () use ($barber, &$files): BarberAccountDeletionOutcome {
            $locked = BarberModel::query()->lockForUpdate()->findOrFail($barber->getKey());

            if ($this->hasBlockingBookings($locked)) {
                return BarberAccountDeletionOutcome::ActiveBookings;
            }

            if ($this->hasActiveAffiliation($locked)) {
                return BarberAccountDeletionOutcome::ActiveAffiliation;
            }

            $files = $locked->portfolioPhotos()->pluck('image_path')->all();
            $this->anonymise($locked);

            return BarberAccountDeletionOutcome::Deleted;
        });

        if ($outcome === BarberAccountDeletionOutcome::Deleted) {
            Storage::disk('public')->delete($files);
            $barber->refresh();
        }

        return $outcome;
    }

    private function hasBlockingBookings(BarberModel $barber): bool
    {
        return $barber->bookings()->whereIn('booking_status', BookingStatus::reservationBlockingValues())->exists();
    }

    private function hasActiveAffiliation(BarberModel $barber): bool
    {
        return BarberAffiliationModel::query()
            ->where('barber_id', $barber->getKey())
            ->where('status', AffiliationStatus::Active->value)
            ->exists();
    }

    private function anonymise(BarberModel $locked): void
    {
        $id = $locked->getKey();

        $locked->tokens()->delete();
        $this->deviceTokens->deleteAllForAccount($locked);
        $locked->portfolioPhotos()->delete();
        BarberScheduleModel::query()->where('barber_id', $id)->delete();
        ChairModel::query()->where('barber_id', $id)->update(['barber_id' => null]);
        BarberAffiliationModel::query()
            ->where('barber_id', $id)
            ->where('status', AffiliationStatus::Pending->value)
            ->update(['status' => AffiliationStatus::Rejected->value]);

        $locked->setTranslations('name', [
            'en' => __('barber::messages.deleted_barber_name', [], 'en'),
            'ar' => __('barber::messages.deleted_barber_name', [], 'ar'),
        ]);
        $locked->forceFill([
            'email' => null,
            'email_verified_at' => null,
            'phone' => null,
            'password' => Hash::make(Str::random(64)),
            'remember_token' => null,
            'has_login' => false,
            'client_id' => null,
            'latitude' => null,
            'longitude' => null,
            'travel_radius_km' => null,
            'is_workstation_online' => false,
            'status' => BarberStatusEnum::Disabled,
        ])->save();

        // Spatie's translatable setter only clears the current locale, so the bio is nulled whole at the query level.
        BarberModel::query()->whereKey($id)->toBase()->update(['bio' => null]);
    }
}
