<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Support\Facades\Hash;
use Modules\Barber\Enums\BarberAccountDeletionOutcome;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberAccountDeletion;

final class DeleteAccountHandler
{
    public function __construct(
        private readonly BarberAccountDeletion $deletion,
    ) {}

    public function handle(BarberModel $barber, string $password): BarberAccountDeletionOutcome
    {
        if (! is_string($barber->password) || ! Hash::check($password, $barber->password)) {
            return BarberAccountDeletionOutcome::InvalidPassword;
        }

        return $this->deletion->delete($barber);
    }
}
