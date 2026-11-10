<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\AdminUsers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Http\Resources\Admin\AdminUserResource;
use Modules\Admin\Services\AdminUserService;
use Modules\Core\Http\Actions\BaseApiAction;

final class ReactivateAdminUserAction extends BaseApiAction
{
    public function __construct(private readonly AdminUserService $admins) {}

    public function __invoke(Request $request, string $admin): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(AdminUserConstants::MANAGE_ABILITY);

        return $this->ok(data: new AdminUserResource($this->admins->reactivate($admin)), message: __('admin::messages.reactivated'));
    }
}
