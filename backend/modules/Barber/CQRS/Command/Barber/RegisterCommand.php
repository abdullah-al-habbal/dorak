<?php

declare(strict_types=1);

namespace Modules\Barber\CQRS\Command\Barber;

final readonly class RegisterCommand
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public bool $isFreelancer,
        public ?string $phone,
    ) {}
}
