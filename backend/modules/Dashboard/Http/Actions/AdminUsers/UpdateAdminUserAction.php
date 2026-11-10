<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\AdminUsers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Http\Resources\AdminUserResource;
use Modules\Admin\Services\AdminUserService;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\AdminUserRequest;

final class UpdateAdminUserAction extends BaseApiAction
{
    public function __construct(private readonly AdminUserService $admins) {}

    public function __invoke(AdminUserRequest $request, string $admin): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(AdminUserConstants::MANAGE_ABILITY);
        $updated = $this->admins->update($admin, ['name' => $request->names(), 'email' => $request->email()]);

        return $this->ok(data: new AdminUserResource($updated), message: __('admin::messages.updated'));
    }
}
