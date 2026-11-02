<?php

declare(strict_types=1);

namespace Modules\Dashboard\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

#[Fillable([
    'actor_type',
    'actor_id',
    'guard',
    'token_hash',
    'expires_at',
    'revoked_at',
    'replaced_by_token_id',
])]
#[Table('dashboard_refresh_tokens')]
class DashboardRefreshTokenModel extends Model
{
    protected function casts(): array
    {
        return [
            'actor_type' => DashboardActorTypeEnum::class,
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isActive(): bool
    {
        return ! $this->isRevoked() && ! $this->isExpired();
    }
}
