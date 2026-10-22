<?php

declare(strict_types=1);

namespace Modules\Core\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Modules\Core\Models\NotificationModel;

final class NotificationInboxEloquentResolver
{
    /**
     * Unread rows first, newest first within each group. The CASE keeps the
     * order identical on MySQL and PostgreSQL, which sort NULLs differently.
     *
     * @return LengthAwarePaginator<int, NotificationModel>
     */
    public function paginate(string $notifiableType, string $notifiableId, int $perPage): LengthAwarePaginator
    {
        return $this->scoped($notifiableType, $notifiableId)
            ->orderByRaw('CASE WHEN read_at IS NULL THEN 0 ELSE 1 END')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function unreadCount(string $notifiableType, string $notifiableId): int
    {
        return $this->scoped($notifiableType, $notifiableId)->whereNull('read_at')->count();
    }

    /**
     * Another actor's notification is indistinguishable from a missing one,
     * so this throws ModelNotFoundException (404) for both.
     */
    public function markRead(string $notifiableType, string $notifiableId, string $notificationId): NotificationModel
    {
        $notification = $this->scoped($notifiableType, $notifiableId)->whereKey($notificationId)->firstOrFail();
        if ($notification->read_at === null) {
            $notification->forceFill(['read_at' => Carbon::now()])->save();
        }

        return $notification;
    }

    public function markAllRead(string $notifiableType, string $notifiableId): int
    {
        return $this->scoped($notifiableType, $notifiableId)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);
    }

    /**
     * @return Builder<NotificationModel>
     */
    private function scoped(string $notifiableType, string $notifiableId): Builder
    {
        return NotificationModel::query()
            ->where('notifiable_type', $notifiableType)
            ->where('notifiable_id', $notifiableId);
    }
}
