<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\UpdateNotificationPreferencesCommand;

final class UpdateNotificationPreferencesRequest extends BaseApiFormRequest
{
    private const Keys = ['email_enabled', 'push_enabled', 'booking_enabled', 'system_enabled'];

    public function rules(): array
    {
        return [
            'email_enabled' => ['required', 'boolean'],
            'push_enabled' => ['required', 'boolean'],
            'booking_enabled' => ['required', 'boolean'],
            'system_enabled' => ['required', 'boolean'],
        ];
    }

    public function toCommand(): UpdateNotificationPreferencesCommand
    {
        $values = $this->validated();
        $preferences = [];
        foreach (self::Keys as $key) {
            $preferences[$key] = (bool) $values[$key];
        }

        return new UpdateNotificationPreferencesCommand($preferences);
    }
}
