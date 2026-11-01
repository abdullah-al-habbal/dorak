<?php

declare(strict_types=1);

namespace Modules\Dashboard\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

#[Fillable(['actor_type', 'actor_id', 'email_enabled', 'push_enabled', 'booking_enabled', 'system_enabled'])]
#[Table('dashboard_notification_preferences')]
final class DashboardNotificationPreferenceModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'actor_type' => DashboardActorTypeEnum::class,
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'booking_enabled' => 'boolean',
            'system_enabled' => 'boolean',
        ];
    }
}
