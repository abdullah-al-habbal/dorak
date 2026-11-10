<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\AdminUsers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Http\Resources\Admin\AdminUserResource;
use Modules\Admin\Services\AdminUserService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\AdminUserRequest;

final class InviteAdminUserAction extends BaseApiAction
{
    public function __construct(private readonly AdminUserService $admins) {}

    public function __invoke(AdminUserRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(AdminUserConstants::MANAGE_ABILITY);
        $admin = $this->admins->invite($request->names(), $request->email(), app()->getLocale());

        return $this->created(data: new AdminUserResource($admin), message: __('admin::messages.invited'));
    }
}
