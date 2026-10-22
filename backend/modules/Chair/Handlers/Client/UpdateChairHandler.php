<?php

declare(strict_types=1);

namespace Modules\Chair\Handlers\Client;

use Modules\Chair\CQRS\Command\Client\UpdateChairCommand;
use Modules\Chair\Eloquent\Resolvers\Client\UpdateChairEloquentResolver;
use Modules\Chair\ValuesObjects\ChairStatusChangeResult;

final class UpdateChairHandler
{
    public function __construct(
        private readonly UpdateChairEloquentResolver $resolver,
    ) {}

    public function handle(UpdateChairCommand $command): ChairStatusChangeResult
    {
        return $this->resolver->resolve($command);
    }
}
