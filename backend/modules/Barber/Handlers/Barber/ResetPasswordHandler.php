<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Support\Facades\Hash;
use Modules\Barber\CQRS\Command\Barber\ResetPasswordCommand;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\AccountPasswordReplacement;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
        private readonly AccountPasswordReplacement $passwords,
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

        // No token, dashboard session or dashboard reset link outlives a password set in the app (BG-60).
        $this->passwords->replace(DashboardActorTypeEnum::Barber, $barber, Hash::make($command->password));

        return true;
    }
}
