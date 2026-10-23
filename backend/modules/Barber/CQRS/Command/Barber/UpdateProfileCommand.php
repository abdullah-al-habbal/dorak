<?php

declare(strict_types=1);

namespace Modules\Barber\CQRS\Command\Barber;

use Modules\Core\Enums\VenueUniverse;

final readonly class UpdateProfileCommand
{
    public function __construct(
        public string $barberId,
        public ?array $name,
        public ?string $email,
        public ?string $password,
        public ?bool $isFreelancer,
        public ?VenueUniverse $universe = null,
    ) {}
}
