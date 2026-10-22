<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowBranchQuery
{
    /**
     * @param  list<string>|null  $scopeBrandIds  null = unrestricted
     * @param  list<string>|null  $scopeBranchIds  null = unrestricted
     */
    public function __construct(public string $id, public ?array $scopeBrandIds, public ?array $scopeBranchIds = null) {}
}
