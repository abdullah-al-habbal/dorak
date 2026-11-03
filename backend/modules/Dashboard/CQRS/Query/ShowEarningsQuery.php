<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

use Carbon\CarbonInterface;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class ShowEarningsQuery
{
    /** @param list<string> $branchIds branches the actor may read (brand owner, branch manager); unused for a stylist */
    public function __construct(
        public DashboardActorTypeEnum $actorType,
        public string $actorId,
        public array $branchIds,
        public ?CarbonInterface $from = null,
        public ?CarbonInterface $to = null,
    ) {}
}
