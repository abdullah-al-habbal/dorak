<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Password;

use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\ResetDashboardPasswordCommand;
use Modules\Dashboard\Repositories\DashboardPasswordResetAccountResolver;
use Modules\Dashboard\Services\DashboardCredentialRevoker;
use Modules\Dashboard\Services\DashboardMobileResetCodeCleaner;

/**
 * Sets a new password from a reset link. Returns false, without saying why, for
 * an unknown or no-longer-eligible account and for a wrong, expired or used
 * token. The account row is locked so one token can never be used twice.
 */
final class ResetDashboardPasswordHandler
{
    public function __construct(
        private readonly DashboardPasswordResetAccountResolver $accounts,
        private readonly PasswordBrokerFactory $brokers,
        private readonly DashboardCredentialRevoker $credentials,
        private readonly DashboardMobileResetCodeCleaner $mobileCodes,
    ) {}

    public function handle(ResetDashboardPasswordCommand $command): bool
    {
        $account = $this->accounts->find($command->actorType, $command->email);

        // Checked before the app code is burned, so a wrong link can't burn it; checked again under the lock below.
        if ($account === null || ! $this->tokenIsValid($command, $account)) {
            return false;
        }

        // Burned first and outside the transaction (BG-28): if it fails, the password and the link stay as they were.
        $this->mobileCodes->clear($command->actorType, (string) $account->getKey());

        return DB::transaction(fn (): bool => $this->reset($command, $account));
    }

    private function reset(ResetDashboardPasswordCommand $command, AdminModel|BranchModel|BarberModel|ClientModel $account): bool
    {
        $account->newQuery()->whereKey($account->getKey())->lockForUpdate()->first();

        if (! $this->tokenIsValid($command, $account)) {
            return false;
        }

        $account->forceFill(['password' => $command->password])->save();
        $this->credentials->revokeAll($command->actorType, $account);

        return true;
    }

    private function tokenIsValid(ResetDashboardPasswordCommand $command, AdminModel|BranchModel|BarberModel|ClientModel $account): bool
    {
        return $this->brokers->broker($command->actorType->passwordBroker()->value)->tokenExists($account, $command->token);
    }
}
