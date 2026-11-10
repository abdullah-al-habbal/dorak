<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Notifications;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardNotificationScope;

final class MarkAllDashboardNotificationsReadAction extends BaseApiAction
{
    public function __construct(private readonly DashboardNotificationScope $scope) {}

    public function __invoke(Request $request): JsonResponse
    {
        $updated = $this->scope->for($request)->whereNull('read_at')->update(['read_at' => now()]);

        return $this->updated(data: ['updated' => $updated, 'unread_count' => 0]);
    }
}
