<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

/** An existing app client signs in with their password and creates their first brand. */
final readonly class CreateOwnerBrandCommand
{
    /** @param array<string, mixed> $brand the validated brand payload */
    public function __construct(
        public string $email,
        public string $password,
        public array $brand,
    ) {}
}
