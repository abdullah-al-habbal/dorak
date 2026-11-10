<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Services\AccountBanService;
use Modules\Client\Http\Resources\Admin\AdminClientResource;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\BanAccountRequest;

final class BanClientAction extends BaseApiAction
{
    public function __construct(private readonly AccountBanService $bans) {}

    public function __invoke(BanAccountRequest $request, string $client): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);

        $this->bans->ban(BannableTypeEnum::Client, $client, $admin, $request->reason(), $request->expiresAt());

        return $this->ok(
            data: new AdminClientResource(ClientModel::query()->withCount('bookings')->with('bans.admin')->findOrFail($client)),
            message: __('ban::ui.client_banned'),
        );
    }
}
