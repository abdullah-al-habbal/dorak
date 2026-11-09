<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Handlers\Admin;

use Modules\ServiceCatalog\CQRS\Command\Admin\SaveCatalogCategoryCommand;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategorySlugGenerator;

/** Creates a top-level category (slug generated, universe defaults to unisex) or updates one in place. */
final readonly class SaveCatalogCategoryHandler
{
    public function __construct(private CatalogCategorySlugGenerator $slugs) {}

    public function create(SaveCatalogCategoryCommand $command): ServiceCatalogCategoryModel
    {
        $category = new ServiceCatalogCategoryModel(['slug' => $this->slugs->generate($command->englishName())]);

        return $this->fill($category, $command);
    }

    public function update(ServiceCatalogCategoryModel $category, SaveCatalogCategoryCommand $command): ServiceCatalogCategoryModel
    {
        return $this->fill($category, $command);
    }

    private function fill(ServiceCatalogCategoryModel $category, SaveCatalogCategoryCommand $command): ServiceCatalogCategoryModel
    {
        $attributes = $command->attributes;
        $hasDescription = array_key_exists('description', $attributes);
        $description = $this->translations($attributes['description'] ?? null);
        unset($attributes['description']);

        $category->fill($attributes);
        if ($hasDescription) {
            $category->replaceTranslations('description', $description);
        }
        $category->save();

        return $category;
    }

    /** @return array<string, string> the non-empty translations only */
    private function translations(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_filter($value, fn (mixed $text): bool => is_string($text) && trim($text) !== '');
    }
}
