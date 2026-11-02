<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardNotificationPreferenceConstants;
use Modules\Dashboard\CQRS\Command\UpdateNotificationPreferencesCommand;

final class UpdateNotificationPreferencesRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'allows_email_notifications' => ['required', 'boolean'],
            'allows_push_notifications' => ['required', 'boolean'],
            'allows_booking_notifications' => ['required', 'boolean'],
            'allows_system_notifications' => ['required', 'boolean'],
        ];
    }

    public function toCommand(): UpdateNotificationPreferencesCommand
    {
        $values = $this->validated();
        $preferences = [];
        foreach (DashboardNotificationPreferenceConstants::DASHBOARD_NOTIFICATION_PREFERENCE_KEYS as $key) {
            $preferences[$key] = (bool) $values[$key];
        }

        return new UpdateNotificationPreferencesCommand($preferences);
    }
}
