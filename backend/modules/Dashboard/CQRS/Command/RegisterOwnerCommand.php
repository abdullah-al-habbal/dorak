<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

/** @param array<string, mixed> $brand the validated brand payload */
final readonly class RegisterOwnerCommand
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $phone,
        public array $brand,
        public string $locale,
        public bool $honeypotTripped,
    ) {}
}
