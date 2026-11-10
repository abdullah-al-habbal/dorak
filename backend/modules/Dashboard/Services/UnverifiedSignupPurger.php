<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Support\Facades\DB;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\ClientAccountDeletion;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;

/**
 * Removes sign-ups that never confirmed their email within the retention period
 * (D3 defaults: 7 days). Only a plain email sign-up qualifies: no social login,
 * no confirmed phone, no bookings, and a brand only while it is still pending
 * with nothing booked. Accounts go through `ClientAccountDeletion`, the single
 * deletion path, so they are anonymised and their email is free again.
 */
final class UnverifiedSignupPurger
{
    public function __construct(private readonly ClientAccountDeletion $deletion) {}

    public function purge(): int
    {
        $removed = 0;
        $cutoff = now()->subDays(OwnerRegistrationConstants::UNVERIFIED_SIGNUP_RETENTION_DAYS);

        ClientModel::query()
            ->whereNull('email_verified_at')
            ->whereNull('phone_verified_at')
            ->where('status', ClientStatusEnum::Pending->value)
            ->where('created_at', '<', $cutoff)
            ->whereDoesntHave('socialAccounts')
            ->orderBy('created_at')
            ->each(function (ClientModel $client) use (&$removed): void {
                if ($this->removeOne($client)) {
                    $removed++;
                }
            });

        return $removed;
    }

    private function removeOne(ClientModel $client): bool
    {
        if ($this->deletion->hasBlockingBookings($client) || $client->bookings()->exists()) {
            return false;
        }

        $brands = BrandModel::query()->where('owner_id', $client->getKey())->get();

        if ($brands->contains(fn (BrandModel $brand): bool => $brand->status !== BrandStatusEnum::Pending)) {
            return false;
        }

        return DB::transaction(function () use ($client, $brands): bool {
            foreach ($brands as $brand) {
                $brand->branches()->delete();
                $brand->delete();
            }

            return $this->deletion->delete($client);
        });
    }
}
