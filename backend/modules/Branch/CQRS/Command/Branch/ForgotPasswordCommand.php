<?php

declare(strict_types=1);

namespace Modules\Branch\CQRS\Command\Branch;

final readonly class ForgotPasswordCommand
{
    public function __construct(
        public string $email,
    ) {}
}
