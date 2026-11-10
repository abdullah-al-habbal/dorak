<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Owner;

use Illuminate\Support\Facades\DB;
use Modules\Brand\CQRS\Command\Client\CreateBrandCommand;
use Modules\Brand\Handlers\Client\CreateBrandHandler;
use Modules\Client\CQRS\Command\Client\RegisterCommand;
use Modules\Client\Eloquent\Resolvers\Client\RegisterEloquentResolver;
use Modules\Client\Jobs\SendEmailVerificationCodeJob;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\Locale;
use Modules\Dashboard\CQRS\Command\RegisterOwnerCommand;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Public sign-up of a brand owner. The answer never depends on the email: the
 * work runs after the response is sent, so a new email, an unverified one, a
 * verified one and a banned one look and take the same. An existing account is
 * never changed; at most its code is sent again.
 */
final class RegisterOwnerHandler
{
    public function __construct(
        private readonly RegisterEloquentResolver $clients,
        private readonly CreateBrandHandler $brands,
    ) {}

    public function handle(RegisterOwnerCommand $command): void
    {
        if ($command->honeypotTripped) {
            return;
        }

        defer(function () use ($command): void {
            try {
                $this->register($command);
            } catch (Throwable $exception) {
                report($exception);
            }
        });
    }

    private function register(RegisterOwnerCommand $command): void
    {
        $existing = ClientModel::query()->where('email', $command->email)->first();

        if ($existing instanceof ClientModel) {
            $this->resendIfPending($existing);

            return;
        }

        $client = DB::transaction(function () use ($command): ClientModel {
            $client = $this->clients->resolve(new RegisterCommand($command->name, $command->email, $command->password, $command->phone));
            $this->rememberLocale($client, $command->locale);
            $this->brands->handle(CreateBrandCommand::fromPayload((string) $client->getKey(), $command->brand));

            return $client;
        });

        SendEmailVerificationCodeJob::dispatch((string) $client->getKey());
    }

    private function resendIfPending(ClientModel $client): void
    {
        if ($client->email_verified_at === null && ! $client->isBanned()) {
            SendEmailVerificationCodeJob::dispatch((string) $client->getKey());
        }
    }

    private function rememberLocale(ClientModel $client, string $locale): void
    {
        $language = Locale::tryFrom($locale);

        if ($language !== null) {
            PreferenceModel::query()->updateOrCreate(
                ['preferenceable_type' => PreferenceableTypeEnum::Client, 'preferenceable_id' => $client->getKey()],
                ['preferred_language' => $language],
            );
        }
    }
}
