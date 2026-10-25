<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\CQRS\Command;

final readonly class SetPrimaryFaceProfilePhotoCommand
{
    public function __construct(
        public string $profileId,
    ) {}
}
