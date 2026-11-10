<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\AdminUsers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Admin\Constants\AdminUserConstants;
use Modules\Admin\Http\Resources\Admin\AdminUserResource;
use Modules\Admin\Models\AdminModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListAdminUsersRequest;

final class ListAdminUsersAction extends BaseApiAction
{
    public function __invoke(ListAdminUsersRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(AdminUserConstants::MANAGE_ABILITY);
        $search = $request->search();
        $active = $request->active();

        $admins = AdminModel::query()
            ->when($active !== null, fn ($query) => $active ? $query->whereNull('deactivated_at') : $query->whereNotNull('deactivated_at'))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $inner->where('name->en', 'like', $like)->orWhere('name->ar', 'like', $like)->orWhere('email', 'like', $like);
            }))
            ->orderByRaw('deactivated_at is not null')
            ->orderBy('created_at')
            ->paginate($request->perPage());

        return $this->paginated($admins, AdminUserResource::class);
    }
}
