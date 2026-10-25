<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Handlers;

use Modules\ClientFaceProfile\CQRS\Command\SetPrimaryFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Eloquent\Resolvers\SetPrimaryFaceProfilePhotoEloquentResolver;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;

final class SetPrimaryFaceProfilePhotoHandler
{
    public function __construct(
        private readonly SetPrimaryFaceProfilePhotoEloquentResolver $resolver,
    ) {}

    public function handle(SetPrimaryFaceProfilePhotoCommand $command): ClientFaceProfileModel
    {
        return $this->resolver->resolve($command);
    }
}
