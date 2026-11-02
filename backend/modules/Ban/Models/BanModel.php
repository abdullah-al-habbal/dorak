<?php

// modules/Ban/Models/BanModel.php
declare(strict_types=1);

namespace Modules\Ban\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Enums\BannableTypeEnum;

#[Fillable([
    'bannable_id',
    'bannable_type',
    'reason',
    'banned_at',
    'expires_at',
    'banned_by_id',
])]
#[Table('bans')]
class BanModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'bannable_type' => BannableTypeEnum::class,
            'banned_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function bannable(): MorphTo
    {
        return $this->morphTo();
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminModel::class, 'banned_by_id');
    }

    /**
     * @param  Builder<BanModel>  $query
     * @return Builder<BanModel>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query
            ->where('banned_at', '<=', now())
            ->where(fn (Builder $q) => $q
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>', now())
            );
    }
}
