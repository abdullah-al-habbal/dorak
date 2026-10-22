<?php

declare(strict_types=1);

namespace Modules\Barber\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;
use Illuminate\Queue\Attributes\Tries;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberEmailVerification;

#[Tries(3)]
#[Timeout(120)]
#[Backoff(10, 30, 60)]
class SendBarberEmailVerificationCodeJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        private readonly string $barberId,
    ) {}

    public function handle(BarberEmailVerification $verification): void
    {
        $barber = BarberModel::query()->find($this->barberId);

        if ($barber === null) {
            return;
        }

        $verification->send($barber);
    }
}
