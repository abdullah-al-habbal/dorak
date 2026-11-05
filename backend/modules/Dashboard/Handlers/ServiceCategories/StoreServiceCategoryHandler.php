<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\ServiceCategories;

use Modules\Dashboard\CQRS\Command\StoreServiceCategoryCommand;
use Modules\Dashboard\Eloquent\Resolvers\ServiceCategories\StoreServiceCategoryEloquentResolver;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

final readonly class StoreServiceCategoryHandler
{
    public function __construct(private StoreServiceCategoryEloquentResolver $resolver) {}

    public function handle(StoreServiceCategoryCommand $command): ServiceCatalogCategoryModel
    {
        return $this->resolver->resolve($command->name);
    }
}
