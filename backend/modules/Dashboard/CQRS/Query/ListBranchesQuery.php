<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListBranchesQuery
{
    /**
     * @param  list<string>|null  $brandIds  null = unrestricted
     * @param  list<string>|null  $branchIds  null = unrestricted
     */
    public function __construct(public ?array $brandIds, public int $perPage, public ?array $branchIds = null, public ?string $search = null) {}
}
