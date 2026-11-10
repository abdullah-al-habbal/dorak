<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\BarberApprovals;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Services\AccountBanService;
use Modules\Barber\Constants\BarberReviewConstants;
use Modules\Barber\Http\Resources\Admin\BarberReviewResource;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** NS-08: bans or unbans a barber. The BanObserver revokes their tokens, so the stylist app signs out. */
final class UnbanBarberAction extends BaseApiAction
{
    public function __construct(private readonly AccountBanService $bans) {}

    public function __invoke(Request $request, string $barber): JsonResponse
    {
        $admin = $request->user('admin_api');
        Gate::forUser($admin)->authorize(BarberReviewConstants::REVIEW_ABILITY);

        $this->bans->unban(BannableTypeEnum::Barber, $barber, $admin);

        return $this->ok(
            data: new BarberReviewResource(BarberModel::query()->with(['bans.admin', 'portfolioPhotos'])->findOrFail($barber)),
            message: __('ban::ui.client_unbanned'),
        );
    }
}
