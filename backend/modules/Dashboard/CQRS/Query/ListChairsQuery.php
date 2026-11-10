<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;

final readonly class ListChairsQuery
{
    /** @param list<string>|null $branchIds null = unrestricted */
    public function __construct(public ?array $branchIds, public int $perPage, public ?string $search = null, public ?string $branchId = null, public ?ChairStatus $status = null, public ?FloorZone $floorZone = null, public ?string $brandId = null) {}
}
