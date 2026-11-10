<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Services\AccountBanService;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\BanAccountRequest;

/** NS-08: bans or unbans a barber. The BanObserver revokes their tokens, so the stylist app signs out. */
final class BanBarberAction extends BaseApiAction
{
    public function __construct(private readonly AccountBanService $bans) {}

    public function __invoke(BanAccountRequest $request, string $barber): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize(BarberReviewConstants::REVIEW_ABILITY);

        $this->bans->ban(BannableTypeEnum::Barber, $barber, $admin, $request->reason(), $request->expiresAt());

        return $this->ok(
            data: new BarberReviewResource(BarberModel::query()->with(['bans.admin', 'portfolioPhotos'])->findOrFail($barber)),
            message: __('ban::ui.client_banned'),
        );
    }
}
