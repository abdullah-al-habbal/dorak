<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Illuminate\Support\Facades\Hash;
use Modules\Barber\CQRS\Command\Barber\ResetPasswordCommand;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Enums\PasswordBrokerEnum;
use Modules\Core\Services\DeviceTokenService;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
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
        $barber = $this->resolver->findResettableByEmail($command->email);
        $id = $barber === null ? null : (string) $barber->id;

        if (! $this->codes->redeem(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BARBER, $id, $command->code)) {
            return false;
        }

        $barber->update(['password' => Hash::make($command->password)]);
        $barber->tokens()->delete();
        $this->deviceTokens->revokeAllForAccount($barber);
        // A dashboard reset link must not outlive a password set in the app.
        $this->brokers->broker(PasswordBrokerEnum::Barbers->value)->deleteToken($barber);

        return true;
    }
}
