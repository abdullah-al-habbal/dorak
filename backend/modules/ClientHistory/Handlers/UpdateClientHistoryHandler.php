<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Handlers;

use Modules\ClientHistory\CQRS\Command\UpdateClientHistoryCommand;
use Modules\ClientHistory\Eloquent\Resolvers\UpdateClientHistoryEloquentResolver;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;

final class UpdateClientHistoryHandler
{
    public function __construct(
        private readonly UpdateClientHistoryEloquentResolver $resolver,
    ) {}

    public function handle(UpdateClientHistoryCommand $command): ClientServiceHistoryModel
    {
        return $this->resolver->resolve($command);
    }
}
