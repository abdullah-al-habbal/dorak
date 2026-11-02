<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Modules\Booking\Enums\BookingStatus;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

/**
 * The only way a client account is deleted, for both the client's own
 * `DELETE client/account` and the admin panel. The account is soft-deleted
 * (the row must survive for the FACE-3 grace period and for the bookings that
 * reference it) after every personal field is scrubbed. Modules that hold
 * client-linked data anonymize it from a `ClientModel` `deleted` observer,
 * which runs inside the same transaction (HIST-2).
 */
final class ClientAccountDeletion
{
    public function hasBlockingBookings(ClientModel $client): bool
    {
        return $client->bookings()
            ->whereIn('booking_status', BookingStatus::reservationBlockingValues())
            ->exists();
    }

    /**
     * Returns false, leaving the account untouched, while any booking is
     * pending, confirmed, or in progress.
     */
    public function delete(ClientModel $client): bool
    {
        $avatar = DB::transaction(function () use ($client): string|false|null {
            $locked = ClientModel::query()->lockForUpdate()->findOrFail($client->getKey());

            if ($this->hasBlockingBookings($locked)) {
                return false;
            }

            $avatar = $locked->getAttribute('avatar');

            $locked->tokens()->delete();
            $locked->socialAccounts()->delete();

            $locked->setTranslations('name', [
                'en' => __('client::messages.deleted_client_name', [], 'en'),
                'ar' => __('client::messages.deleted_client_name', [], 'ar'),
            ]);
            $locked->forceFill([
                'email' => "deleted-{$locked->getKey()}@deleted.invalid",
                'email_verified_at' => null,
                'phone' => null,
                'phone_verified_at' => null,
                'avatar' => null,
                'password' => Hash::make(Str::random(64)),
                'remember_token' => null,
                'status' => ClientStatusEnum::Disabled,
            ])->save();

            $locked->delete();

            return is_string($avatar) ? $avatar : null;
        });

        if ($avatar === false) {
            return false;
        }

        if ($avatar !== null) {
            Storage::disk('public')->delete($avatar);
        }

        $client->refresh();

        return true;
    }
}
