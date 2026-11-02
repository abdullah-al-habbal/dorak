<?php

declare(strict_types=1);

namespace Modules\Dashboard\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

#[Fillable(['actor_type', 'actor_id', 'allows_email_notifications', 'allows_push_notifications', 'allows_booking_notifications', 'allows_system_notifications'])]
#[Table('dashboard_notification_preferences')]
final class DashboardNotificationPreferenceModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'actor_type' => DashboardActorTypeEnum::class,
            'allows_email_notifications' => 'boolean',
            'allows_push_notifications' => 'boolean',
            'allows_booking_notifications' => 'boolean',
            'allows_system_notifications' => 'boolean',
        ];
    }
}
