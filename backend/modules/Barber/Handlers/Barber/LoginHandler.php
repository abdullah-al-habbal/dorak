<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Illuminate\Support\Facades\Hash;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Barber\CQRS\Command\Barber\LoginCommand;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Repositories\LoginEloquentResolver;
use Modules\Barber\ValuesObjects\LoginResult;

final class LoginHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
    ) {}

    public function handle(LoginCommand $command): LoginResult
    {
        $barber = $this->resolver->findByEmail($command->email);

        if ($barber === null || $barber->getAttribute('has_login') !== true || $barber->getAttribute('password') === null || ! Hash::check($command->password, $barber->getAttribute('password'))) {
            return LoginResult::invalidCredentials();
        }

        if ($barber->isBanned()) {
            throw new AccountBannedException;
        }

        if ($barber->getAttribute('status') !== BarberStatusEnum::Enabled) {
            throw new AccountNotActiveException;
        }

        $token = $barber->createToken('barber-app')->plainTextToken;

        return LoginResult::success(
            token: $token,
            barberData: [
                'id' => $barber->id,
                'name' => $barber->name,
                'email' => $barber->email,
                'status' => $barber->status->value,
            ],
        );
    }
}
