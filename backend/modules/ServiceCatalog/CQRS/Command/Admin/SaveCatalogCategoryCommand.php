<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\CQRS\Command\Admin;

/** Validated category fields; keys absent from the request stay absent, so an update keeps them. */
final readonly class SaveCatalogCategoryCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(
        public array $attributes,
    ) {}

    public function englishName(): string
    {
        $name = $this->attributes['name'] ?? [];

        return is_array($name) && is_string($name['en'] ?? null) ? $name['en'] : '';
    }
}
