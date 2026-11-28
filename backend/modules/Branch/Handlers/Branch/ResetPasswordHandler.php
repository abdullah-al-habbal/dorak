<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Illuminate\Support\Facades\Hash;
use Modules\Branch\CQRS\Command\Branch\ResetPasswordCommand;
use Modules\Branch\Repositories\BranchLoginEloquentResolver;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\AccountPasswordReplacement;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly BranchLoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
        private readonly AccountPasswordReplacement $passwords,
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

        // No token, dashboard session or dashboard reset link outlives a password set in the app (BG-60).
        $this->passwords->replace(DashboardActorTypeEnum::Branch, $branch, Hash::make($command->password));

        return true;
    }
}
