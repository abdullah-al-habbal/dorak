<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Client\CQRS\Command\Client\VerifyResetCodeCommand;
use Modules\Client\Repositories\ForgotPasswordEloquentResolver;
use Modules\Client\Services\PasswordResetCodeVerifier;

final class VerifyResetCodeHandler
{
    public function __construct(
        private readonly ForgotPasswordEloquentResolver $resolver,
        private readonly PasswordResetCodeVerifier $codes,
    ) {}

    /**
     * Returns whether the code is currently valid for the email. Never
     * consumes the code; an unknown email fails exactly like a wrong code.
     */
    public function handle(VerifyResetCodeCommand $command): bool
    {
        $client = $this->resolver->findByEmail($command->email);

        return $this->codes->verify($client === null ? null : (string) $client->id, $command->code);
    }
}
