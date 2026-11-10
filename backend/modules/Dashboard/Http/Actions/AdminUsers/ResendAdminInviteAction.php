<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\AdminUsers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Services\AdminUserService;
use Modules\Core\Http\Actions\BaseApiAction;

final class ResendAdminInviteAction extends BaseApiAction
{
    public function __construct(private readonly AdminUserService $admins) {}

    public function __invoke(Request $request, string $admin): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(AdminUserConstants::MANAGE_ABILITY);
        $sent = $this->admins->resendInvite($admin, app()->getLocale());

        return $sent
            ? $this->success(message: __('admin::messages.invite_resent'))
            : $this->unprocessable(message: __('admin::messages.invite_throttled'));
    }
}
