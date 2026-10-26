<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListServicesQuery
{
    /** @param list<string>|null $brandIds null = unrestricted */
    public function __construct(public ?array $brandIds, public int $perPage, public ?string $search = null) {}
}
