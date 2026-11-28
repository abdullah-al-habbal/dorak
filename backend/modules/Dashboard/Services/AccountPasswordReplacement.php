<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

/**
 * Saves a password set in an app and ends the account's sessions as one change (BG-60): a failure leaves both as they
 * were. The account row is locked, so changes to one account's password happen one at a time. A one-time code that
 * authorised the change is burned by the caller first, outside this transaction (BG-28).
 */
final class AccountPasswordReplacement
{
    public function __construct(
        private readonly DashboardCredentialRevoker $credentials,
    ) {}

    public function replace(DashboardActorTypeEnum $actorType, AdminModel|BranchModel|BarberModel|ClientModel $account, string $hashedPassword): void
    {
        DB::transaction(function () use ($actorType, $account, $hashedPassword): void {
            $account->newQuery()->whereKey($account->getKey())->lockForUpdate()->first();
            $account->update(['password' => $hashedPassword]);
            $this->credentials->revokeAll($actorType, $account);
        });
    }
}
