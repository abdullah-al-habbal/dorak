<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Support\Facades\Mail;
use Modules\Barber\CQRS\Command\Barber\ForgotPasswordCommand;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Client\Mail\SendPasswordResetCode;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ForgotPasswordHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
    ) {}

    /**
     * Always completes silently so the route cannot be used to find out which
     * emails belong to a barber account.
     */
    public function handle(ForgotPasswordCommand $command): void
    {
        $barber = $this->resolver->findResettableByEmail($command->email);

        if ($barber === null) {
            return;
        }

        $code = (string) random_int(100000, 999999);

        $this->codes->issue('barber', (string) $barber->id, $code);

        Mail::to($barber->email)->send(new SendPasswordResetCode($code));
    }
}
