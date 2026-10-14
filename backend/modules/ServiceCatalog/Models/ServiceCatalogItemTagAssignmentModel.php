<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Table('service_catalog_item_tag_assignments')]
class ServiceCatalogItemTagAssignmentModel extends Pivot
{
    use HasUuids;
}
