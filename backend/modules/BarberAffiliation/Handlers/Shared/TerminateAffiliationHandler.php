<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Handlers\Shared;

use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Eloquent\Resolvers\Shared\TerminateAffiliationEloquentResolver;
use Modules\BarberAffiliation\ValuesObjects\TerminateAffiliationResult;

final class TerminateAffiliationHandler
{
    public function __construct(
        private readonly TerminateAffiliationEloquentResolver $resolver,
    ) {}

    public function handle(TerminateAffiliationCommand $command): TerminateAffiliationResult
    {
        return $this->resolver->resolve($command);
    }
}
