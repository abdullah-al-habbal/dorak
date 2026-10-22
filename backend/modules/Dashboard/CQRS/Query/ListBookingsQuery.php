<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListBookingsQuery
{
    /**
     * @param  list<string>|null  $branchIds  null = unrestricted
     * @param  array<string, mixed>  $filters
     */
    public function __construct(public ?array $branchIds, public array $filters) {}
}
