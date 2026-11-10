<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/** Paging for a client's bookings and reviews. */
final class ListClientRelationRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function perPage(): int
    {
        $settings = app(SettingsService::class);
        $requested = $this->integer('per_page', $settings->int(SettingKey::PaginationDefaultPerPage));

        return min(max($requested, DashboardBrandConstants::DASHBOARD_BRAND_MIN_PER_PAGE), $settings->int(SettingKey::PaginationMaxPerPage));
    }
}
