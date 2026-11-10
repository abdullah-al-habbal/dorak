<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Notifications;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Resources\Shared\NotificationResource;
use Modules\Dashboard\Http\Requests\Business\ListDashboardNotificationsRequest;
use Modules\Dashboard\Support\DashboardNotificationScope;

/** NS-10 (D5): the dashboard inbox of any account type; the unread count in `meta` is what the bell polls. */
final class ListDashboardNotificationsAction extends BaseApiAction
{
    public function __construct(private readonly DashboardNotificationScope $scope) {}

    public function __invoke(ListDashboardNotificationsRequest $request): JsonResponse
    {
        $inbox = $this->scope->for($request);
        $unread = (clone $inbox)->whereNull('read_at')->count();

        $page = $inbox
            ->when($request->unreadOnly(), fn ($query) => $query->whereNull('read_at'))
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($page, NotificationResource::class, meta: ['unread_count' => $unread]);
    }
}
