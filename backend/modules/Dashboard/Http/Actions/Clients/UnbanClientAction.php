<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Ban\Services\ClientBanService;
use Modules\Client\Http\Resources\Admin\AdminClientResource;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class UnbanClientAction extends BaseApiAction
{
    public function __construct(private readonly ClientBanService $bans) {}

    public function __invoke(Request $request, string $client): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);

        $this->bans->unban($client, $admin);

        return $this->ok(
            data: new AdminClientResource(ClientModel::query()->withCount('bookings')->with('bans.admin')->findOrFail($client)),
            message: __('ban::ui.client_unbanned'),
        );
    }
}
