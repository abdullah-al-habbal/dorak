<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use LogicException;
use Modules\Core\Models\NotificationModel;

/** NS-10: the inbox of the signed-in dashboard account and nobody else's. */
final class DashboardNotificationScope
{
    /** @return Builder<NotificationModel> */
    public function for(Request $request): Builder
    {
        $account = $request->attributes->get('dashboard_model');
        if (! $account instanceof Model) {
            throw new LogicException(__('dashboard::messages.guard_unsupported'));
        }

        return NotificationModel::query()
            ->where('notifiable_type', $account->getMorphClass())
            ->where('notifiable_id', $account->getKey());
    }
}
