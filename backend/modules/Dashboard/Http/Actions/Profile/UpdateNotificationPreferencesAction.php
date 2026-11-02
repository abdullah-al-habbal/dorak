<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\UpdateNotificationPreferencesHandler;
use Modules\Dashboard\Http\Requests\Business\UpdateNotificationPreferencesRequest;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateNotificationPreferencesAction extends BaseApiAction
{
    public function __construct(private readonly UpdateNotificationPreferencesHandler $handler) {}

    public function __invoke(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $preference = $this->handler->handle($actor, $request->toCommand());

        return $this->updated($this->data($preference));
    }

    /** @return array{allows_email_notifications: bool, allows_push_notifications: bool, allows_booking_notifications: bool, allows_system_notifications: bool} */
    private function data(DashboardNotificationPreferenceModel $preference): array
    {
        return [
            'allows_email_notifications' => $preference->allows_email_notifications,
            'allows_push_notifications' => $preference->allows_push_notifications,
            'allows_booking_notifications' => $preference->allows_booking_notifications,
            'allows_system_notifications' => $preference->allows_system_notifications,
        ];
    }
}
