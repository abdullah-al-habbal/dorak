<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Http\Requests\Barber\VerifyEmailRequest;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberEmailVerification;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class VerifyEmailAction extends BaseApiAction
{
    public function __construct(
        private readonly BarberEmailVerification $verification,
    ) {}

    public function __invoke(VerifyEmailRequest $request): JsonResponse
    {
        /** @var BarberModel $barber */
        $barber = Auth::guard('barber')->user();

        if ($barber->getAttribute('email_verified_at') !== null) {
            return $this->ok(
                data: BarberResource::make($barber)->resolve(),
                message: $this->trans('core::messages.email_already_verified'),
            );
        }

        if (! $this->verification->verify($barber, $request->code())) {
            $message = $this->trans('core::messages.invalid_verification_code');

            return $this->unprocessable(
                message: $message,
                errors: ['code' => [$message]],
                code: ErrorCodeEnum::VALIDATION_FAILED,
            );
        }

        return $this->ok(
            data: BarberResource::make($barber->refresh())->resolve(),
            message: $this->trans('core::messages.email_verified'),
        );
    }
}
