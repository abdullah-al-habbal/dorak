<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class StoreServiceCategoryCommand
{
    /** @param array{en: string, ar: string} $name */
    public function __construct(public array $name) {}
}
