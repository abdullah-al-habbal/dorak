<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\GetNotificationPreferencesQuery;
use Modules\Dashboard\Handlers\Profile\GetNotificationPreferencesHandler;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;
use Modules\Dashboard\Support\DashboardActor;

final class GetNotificationPreferencesAction extends BaseApiAction
{
    public function __construct(private readonly GetNotificationPreferencesHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $preference = $this->handler->handle(new GetNotificationPreferencesQuery($actor->actorType, $actor->id));

        return $this->ok($this->data($preference));
    }

    /** @return array{allows_email_notifications: bool, allows_push_notifications: bool, allows_booking_notifications: bool, allows_system_notifications: bool} */
    private function data(?DashboardNotificationPreferenceModel $preference): array
    {
        return [
            'allows_email_notifications' => $preference?->allows_email_notifications ?? true,
            'allows_push_notifications' => $preference?->allows_push_notifications ?? true,
            'allows_booking_notifications' => $preference?->allows_booking_notifications ?? true,
            'allows_system_notifications' => $preference?->allows_system_notifications ?? true,
        ];
    }
}
