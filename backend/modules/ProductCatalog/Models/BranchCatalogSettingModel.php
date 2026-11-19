<?php

declare(strict_types=1);

namespace Modules\ProductCatalog\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Branch\Models\BranchModel;

/**
 * Per-branch opt-in for the product catalog. A branch without a row is disabled.
 *
 * @property string $id
 * @property string $branch_id
 * @property bool $is_active
 */
#[Fillable(['branch_id', 'is_active'])]
#[Table('branch_catalog_settings')]
class BranchCatalogSettingModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<BranchModel, $this> */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }

    /**
     * @param  Builder<BranchCatalogSettingModel>  $query
     * @return Builder<BranchCatalogSettingModel>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
