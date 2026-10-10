<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\UpdateNotificationPreferencesHandler;
use Modules\Dashboard\Http\Requests\UpdateNotificationPreferencesRequest;
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

    /** @return array{email_enabled: bool, push_enabled: bool, booking_enabled: bool, system_enabled: bool} */
    private function data(DashboardNotificationPreferenceModel $preference): array
    {
        return [
            'email_enabled' => $preference->email_enabled,
            'push_enabled' => $preference->push_enabled,
            'booking_enabled' => $preference->booking_enabled,
            'system_enabled' => $preference->system_enabled,
        ];
    }
}
