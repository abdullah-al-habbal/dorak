<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Illuminate\Support\Facades\Hash;
use Modules\Branch\CQRS\Command\Branch\ResetPasswordCommand;
use Modules\Branch\Repositories\BranchLoginEloquentResolver;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly BranchLoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
    ) {}

    /**
     * Returns false for a wrong, expired or unknown-account code, without
     * telling the caller which.
     */
    public function handle(ResetPasswordCommand $command): bool
    {
        $branch = $this->resolver->findByEmail($command->email);
        $id = $branch === null ? null : (string) $branch->id;

        if (! $this->codes->verify('branch', $id, $command->code)) {
            return false;
        }

        $this->codes->consume('branch', $id);

        $branch->update(['password' => Hash::make($command->password)]);
        $branch->tokens()->delete();

        return true;
    }
}
