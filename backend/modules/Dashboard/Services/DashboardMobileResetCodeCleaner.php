<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

/**
 * Burns any pending mobile-app reset code for an account, so a code requested
 * in an app cannot outlive a password set through the dashboard.
 */
final class DashboardMobileResetCodeCleaner
{
    public function __construct(
        private readonly PasswordResetCodeVerifier $clientCodes,
        private readonly StaffPasswordResetCodes $staffCodes,
    ) {}

    public function clear(DashboardActorTypeEnum $actorType, string $accountId): void
    {
        match ($actorType) {
            DashboardActorTypeEnum::Owner => $this->clientCodes->consume($accountId),
            DashboardActorTypeEnum::Branch => $this->staffCodes->consume(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, $accountId),
            DashboardActorTypeEnum::Barber => $this->staffCodes->consume(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BARBER, $accountId),
            DashboardActorTypeEnum::Admin => null,
        };
    }
}
