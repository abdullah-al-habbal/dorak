<?php

declare(strict_types=1);

namespace Modules\Commission\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;
use Modules\Currency\Models\CurrencyModel;

/**
 * @property string $id
 * @property CommissionScope $scope
 * @property string|null $scope_id
 * @property CommissionType $type
 * @property int $value
 * @property string|null $currency_id
 */
#[Fillable(['scope', 'scope_id', 'type', 'value', 'currency_id', 'is_active', 'notes'])]
#[Table('commission_rules')]
class CommissionRuleModel extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'scope' => CommissionScope::class,
            'type' => CommissionType::class,
            'value' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<CurrencyModel, $this> */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(CurrencyModel::class, 'currency_id');
    }
}
