<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Handlers;

use Modules\ClientFaceProfile\CQRS\Command\DeleteFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Eloquent\Resolvers\DeleteFaceProfilePhotoEloquentResolver;

final class DeleteFaceProfilePhotoHandler
{
    public function __construct(
        private readonly DeleteFaceProfilePhotoEloquentResolver $resolver,
    ) {}

    public function handle(DeleteFaceProfilePhotoCommand $command): void
    {
        $this->resolver->resolve($command);
    }
}
