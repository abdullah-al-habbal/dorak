<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Notifications;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Resources\Shared\NotificationResource;
use Modules\Dashboard\Support\DashboardNotificationScope;

final class MarkDashboardNotificationReadAction extends BaseApiAction
{
    public function __construct(private readonly DashboardNotificationScope $scope) {}

    public function __invoke(Request $request, string $notification): JsonResponse
    {
        // Scoped to the signed-in account, so another account's row answers 404, not 403.
        $row = $this->scope->for($request)->findOrFail($notification);
        if ($row->read_at === null) {
            $row->forceFill(['read_at' => now()])->save();
        }

        return $this->updated(data: NotificationResource::make($row));
    }
}
