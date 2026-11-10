<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Modules\Barber\Http\Requests\Barber\ResubmitRequest;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Barber\Services\BarberReviewService;
use Modules\Core\Http\Actions\BaseApiAction;

/** NS-30 / D8: a rejected barber goes back to `pending`, at most three submissions in total. */
final class ResubmitAction extends BaseApiAction
{
    public function __construct(
        private readonly LoginEloquentResolver $barbers,
        private readonly BarberReviewService $reviews,
    ) {}

    public function __invoke(ResubmitRequest $request): JsonResponse
    {
        $barber = $this->barbers->findByEmail((string) $request->validated('email'));
        $password = $barber?->getAttribute('password');

        if (! $barber instanceof BarberModel || ! is_string($password) || ! Hash::check((string) $request->validated('password'), $password)) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }
        if ($barber->isBanned()) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        }

        $this->reviews->resubmit((string) $barber->getKey(), $request->profileFixes());

        return $this->success(message: $this->trans('barber::messages.review_resubmitted'));
    }
}
