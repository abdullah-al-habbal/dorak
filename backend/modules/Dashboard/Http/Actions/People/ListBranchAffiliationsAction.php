<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Resources\Shared\DashboardAffiliationResource;
use Modules\Dashboard\Support\ScopedBranchResolver;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListBranchAffiliationsAction extends BaseApiAction
{
    public function __construct(private readonly ScopedBranchResolver $branches) {}

    public function __invoke(Request $request, string $branch): JsonResponse
    {
        $model = $this->branches->resolve($request, $branch);
        $filters = $request->validate(['status' => ['nullable', Rule::enum(AffiliationStatus::class)]]);

        $affiliations = BarberAffiliationModel::query()
            ->where('affiliable_id', $model->getKey())
            ->where('affiliable_type', 'branch')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->with('barber')
            ->latest()
            ->paginate(app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));

        return $this->paginated($affiliations, DashboardAffiliationResource::class);
    }
}
