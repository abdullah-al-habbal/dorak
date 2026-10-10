<?php

declare(strict_types=1);

namespace Modules\Dashboard\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['actor_type', 'actor_id', 'email', 'code_hash', 'attempts', 'expires_at'])]
#[Table('dashboard_email_changes')]
final class DashboardEmailChangeModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }
}
