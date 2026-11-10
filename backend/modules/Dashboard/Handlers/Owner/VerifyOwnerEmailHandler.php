<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Owner;

use Modules\Brand\Models\BrandModel;
use Modules\Client\CQRS\Command\Client\VerifyEmailCommand;
use Modules\Client\Handlers\Client\VerifyEmailHandler;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\VerifyOwnerEmailCommand;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;
use Modules\Dashboard\Services\OwnerBrandMailer;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Confirms the emailed code and opens the owner session. A session is issued
 * only by the step that flips an account from unverified to verified, so this
 * is never a way to sign in to an account that was already confirmed.
 * Any failure (unknown email, banned, wrong code) returns null alike.
 */
final class VerifyOwnerEmailHandler
{
    public function __construct(
        private readonly VerifyEmailHandler $verifier,
        private readonly DashboardOwnerActorResolver $ownerActors,
        private readonly OwnerBrandMailer $mailer,
    ) {}

    public function handle(VerifyOwnerEmailCommand $command): ?DashboardActor
    {
        $client = ClientModel::query()->where('email', $command->email)->first();

        if (! $client instanceof ClientModel || $client->email_verified_at !== null || $client->isBanned()) {
            return null;
        }

        $result = $this->verifier->handle(new VerifyEmailCommand((string) $client->getKey(), $command->code));

        if ($result->isInvalidCode() || $result->isAlreadyVerified()) {
            return null;
        }

        $actor = $this->ownerActors->forClient($client->refresh());

        if ($actor === null) {
            return null;
        }

        $brand = BrandModel::query()->where('owner_id', $client->getKey())->orderBy('created_at')->first();
        if ($brand instanceof BrandModel) {
            $this->mailer->submitted($brand);
        }

        return $actor;
    }
}
