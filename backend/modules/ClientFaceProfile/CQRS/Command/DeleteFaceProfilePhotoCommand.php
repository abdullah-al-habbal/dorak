<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\CQRS\Command;

final readonly class DeleteFaceProfilePhotoCommand
{
    public function __construct(
        public string $profileId,
    ) {}
}
