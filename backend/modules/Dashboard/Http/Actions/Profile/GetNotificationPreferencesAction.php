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

    /** @return array{email_enabled: bool, push_enabled: bool, booking_enabled: bool, system_enabled: bool} */
    private function data(?DashboardNotificationPreferenceModel $preference): array
    {
        return [
            'email_enabled' => $preference?->email_enabled ?? true,
            'push_enabled' => $preference?->push_enabled ?? true,
            'booking_enabled' => $preference?->booking_enabled ?? true,
            'system_enabled' => $preference?->system_enabled ?? true,
        ];
    }
}
