<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberEmailVerification;
use Modules\Core\Http\Actions\BaseApiAction;

final class SendEmailVerificationAction extends BaseApiAction
{
    public function __construct(
        private readonly BarberEmailVerification $verification,
    ) {}

    public function __invoke(): JsonResponse
    {
        /** @var BarberModel $barber */
        $barber = Auth::guard('barber')->user();

        if (! $this->verification->send($barber)) {
            return $this->success(message: $this->trans('core::messages.email_already_verified'));
        }

        return $this->success(message: $this->trans('core::messages.verification_code_sent'));
    }
}
