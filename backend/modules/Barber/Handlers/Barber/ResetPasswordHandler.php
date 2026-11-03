<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Support\Facades\Hash;
use Modules\Barber\CQRS\Command\Barber\ResetPasswordCommand;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
    ) {}

    /**
     * Returns false for a wrong, expired or unknown-account code, without
     * telling the caller which.
     */
    public function handle(ResetPasswordCommand $command): bool
    {
        $barber = $this->resolver->findResettableByEmail($command->email);
        $id = $barber === null ? null : (string) $barber->id;

        if (! $this->codes->verify('barber', $id, $command->code)) {
            return false;
        }

        $this->codes->consume('barber', $id);

        $barber->update(['password' => Hash::make($command->password)]);
        $barber->tokens()->delete();

        return true;
    }
}
