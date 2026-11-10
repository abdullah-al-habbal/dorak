<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Owner;

use Illuminate\Support\Facades\Hash;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Brand\CQRS\Command\Client\CreateBrandCommand;
use Modules\Brand\Handlers\Client\CreateBrandHandler;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\CreateOwnerBrandCommand;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Services\OwnerBrandMailer;
use Modules\Dashboard\Support\DashboardActor;

/**
 * "I already have a Dorak account": the client proves the password, then creates
 * their first brand on the same account (ADR 0001). Wrong credentials, an
 * unverified account, or an account that already owns a brand all return null.
 */
final class CreateOwnerBrandHandler
{
    public function __construct(
        private readonly CreateBrandHandler $brands,
        private readonly DashboardOwnerActorResolver $ownerActors,
        private readonly OwnerBrandMailer $mailer,
    ) {}

    /** @throws AccountBannedException */
    public function handle(CreateOwnerBrandCommand $command): ?DashboardActor
    {
        $client = ClientModel::query()->where('email', $command->email)->first();
        $stored = $client?->getAttribute('password');

        if (! $client instanceof ClientModel || ! is_string($stored) || ! Hash::check($command->password, $stored)) {
            return null;
        }

        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        if ($client->email_verified_at === null || BrandModel::query()->where('owner_id', $client->getKey())->exists()) {
            return null;
        }

        $brand = $this->brands->handle(CreateBrandCommand::fromPayload((string) $client->getKey(), $command->brand));
        $this->mailer->submitted($brand);

        return $this->ownerActors->forClient($client);
    }
}
