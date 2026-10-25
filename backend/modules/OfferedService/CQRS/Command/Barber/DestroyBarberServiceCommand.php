<?php

declare(strict_types=1);

namespace Modules\OfferedService\CQRS\Command\Barber;

final readonly class DestroyBarberServiceCommand
{
    public function __construct(public string $barberId, public string $serviceId) {}
}
