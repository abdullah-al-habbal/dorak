<?php

declare(strict_types=1);

namespace Modules\Barber\CQRS\Command\Barber;

final readonly class ForgotPasswordCommand
{
    public function __construct(
        public string $email,
    ) {}
}
