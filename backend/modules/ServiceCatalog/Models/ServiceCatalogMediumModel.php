<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\ServiceCatalog\Enums\MediableTypeEnum;
use Modules\ServiceCatalog\Enums\MediaTypeEnum;

#[Fillable(['media_type', 'path', 'alt', 'sort_order'])]
#[Table('service_catalog_media')]
class ServiceCatalogMediumModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'media_type' => MediaTypeEnum::class,
            'mediable_type' => MediableTypeEnum::class,
            'sort_order' => 'integer',
        ];
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
