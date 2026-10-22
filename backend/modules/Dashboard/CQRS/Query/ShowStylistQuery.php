<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowStylistQuery
{
    /** @param list<string>|null $branchIds null = unrestricted */
    public function __construct(public string $stylistId, public ?array $branchIds) {}
}
