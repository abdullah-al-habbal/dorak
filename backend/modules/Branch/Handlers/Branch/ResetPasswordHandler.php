<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Illuminate\Support\Facades\Hash;
use Modules\Branch\CQRS\Command\Branch\ResetPasswordCommand;
use Modules\Branch\Repositories\BranchLoginEloquentResolver;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Enums\PasswordBrokerEnum;
use Modules\Core\Services\DeviceTokenService;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly BranchLoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
        private readonly PasswordBrokerFactory $brokers,
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    /**
     * Returns false for a wrong, expired or unknown-account code, without
     * telling the caller which.
     */
    public function handle(ResetPasswordCommand $command): bool
    {
        $branch = $this->resolver->findByEmail($command->email);
        $id = $branch === null ? null : (string) $branch->id;

        if (! $this->codes->redeem(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, $id, $command->code)) {
            return false;
        }

        $branch->update(['password' => Hash::make($command->password)]);
        $branch->tokens()->delete();
        $this->deviceTokens->revokeAllForAccount($branch);
        // A dashboard reset link must not outlive a password set in the app.
        $this->brokers->broker(PasswordBrokerEnum::Branches->value)->deleteToken($branch);

        return true;
    }
}
