<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Client\Http\Resources\Admin\AdminClientResource;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ShowClientAction extends BaseApiAction
{
    public function __invoke(Request $request, string $client): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);

        $model = ClientModel::query()->withCount('bookings')->with('bans.admin')->findOrFail($client);

        return $this->ok(data: new AdminClientResource($model));
    }
}
