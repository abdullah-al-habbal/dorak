<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class VerifyOwnerEmailCommand
{
    public function __construct(
        public string $email,
        public string $code,
    ) {}
}
