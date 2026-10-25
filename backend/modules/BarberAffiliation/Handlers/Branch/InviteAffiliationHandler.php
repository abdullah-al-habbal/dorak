<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Handlers\Branch;

use Modules\BarberAffiliation\CQRS\Command\Branch\InviteAffiliationCommand;
use Modules\BarberAffiliation\Eloquent\Resolvers\Branch\InviteAffiliationEloquentResolver;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;

final class InviteAffiliationHandler
{
    public function __construct(
        private readonly InviteAffiliationEloquentResolver $resolver,
    ) {}

    public function handle(InviteAffiliationCommand $command): BarberAffiliationModel
    {
        return $this->resolver->resolve($command);
    }
}
