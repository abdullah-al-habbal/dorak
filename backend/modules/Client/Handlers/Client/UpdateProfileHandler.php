<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Client\CQRS\Command\Client\UpdateProfileCommand;
use Modules\Client\Eloquent\Resolvers\Client\UpdateProfileEloquentResolver;
use Modules\Client\Jobs\SendEmailVerificationCodeJob;
use Modules\Client\Models\ClientModel;
use Throwable;

final class UpdateProfileHandler
{
    public function __construct(
        private readonly UpdateProfileEloquentResolver $resolver,
    ) {}

    public function handle(UpdateProfileCommand $command): ClientModel
    {
        $client = $this->resolver->resolve($command);

        if ($client->wasChanged('email_verified_at') && $client->email_verified_at === null) {
            try {
                SendEmailVerificationCodeJob::dispatch((string) $client->id)->afterCommit();
            } catch (Throwable $e) {
                report($e);
            }
        }

        return $client->refresh();
    }
}
