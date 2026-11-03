<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Illuminate\Support\Facades\Mail;
use Modules\Branch\CQRS\Command\Branch\ForgotPasswordCommand;
use Modules\Branch\Repositories\BranchLoginEloquentResolver;
use Modules\Client\Mail\SendPasswordResetCode;
use Modules\Core\Services\StaffPasswordResetCodes;

final class ForgotPasswordHandler
{
    public function __construct(
        private readonly BranchLoginEloquentResolver $resolver,
        private readonly StaffPasswordResetCodes $codes,
    ) {}

    /**
     * Always completes silently so the route cannot be used to find out which
     * emails belong to a branch account.
     */
    public function handle(ForgotPasswordCommand $command): void
    {
        $branch = $this->resolver->findByEmail($command->email);

        if ($branch === null) {
            return;
        }

        $code = (string) random_int(100000, 999999);

        $this->codes->issue('branch', (string) $branch->id, $code);

        Mail::to($branch->email)->send(new SendPasswordResetCode($code));
    }
}
