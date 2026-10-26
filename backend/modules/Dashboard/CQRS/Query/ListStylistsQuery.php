<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListStylistsQuery
{
    /** @param list<string>|null $branchIds null = unrestricted */
    public function __construct(public ?array $branchIds, public int $perPage, public ?string $search = null) {}
}
