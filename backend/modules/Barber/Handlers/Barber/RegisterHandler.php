<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Modules\Barber\CQRS\Command\Barber\RegisterCommand;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Barber\Jobs\SendBarberEmailVerificationCodeJob;
use Modules\Barber\Repositories\RegisterEloquentResolver;
use Throwable;

final class RegisterHandler
{
    public function __construct(
        private readonly RegisterEloquentResolver $resolver,
    ) {}

    /**
     * Self-registered barbers start `pending` until an admin activates them.
     * The returned token is limited to onboarding routes (profile read and
     * email verification) by `EnsureBarberAccountAccess`.
     *
     * @return array{token: string, barber: array<string, mixed>}
     */
    public function handle(RegisterCommand $command): array
    {
        $barber = $this->resolver->resolve($command);

        $token = $barber->createToken('barber-app')->plainTextToken;

        try {
            SendBarberEmailVerificationCodeJob::dispatch((string) $barber->id)->afterCommit();
        } catch (Throwable $e) {
            report($e);
        }

        return [
            'token' => $token,
            'barber' => BarberResource::make($barber->refresh())->resolve(),
        ];
    }
}
