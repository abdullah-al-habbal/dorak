<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Brands;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Constants\DashboardBrandConstants;
use Modules\Dashboard\Http\Requests\Business\UploadBrandLogoRequest;
use Modules\Dashboard\Support\DashboardActor;

/** FT-9: stores a logo on the public disk under a random name and returns its URL for `logo_url`. */
final class UploadBrandLogoAction extends BaseApiAction
{
    public function __invoke(UploadBrandLogoRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.brand.create');

        $path = $request->file('file')->store(DashboardBrandConstants::DASHBOARD_BRAND_LOGO_DIRECTORY, 'public');

        return $this->created(['url' => Storage::disk('public')->url($path)]);
    }
}
