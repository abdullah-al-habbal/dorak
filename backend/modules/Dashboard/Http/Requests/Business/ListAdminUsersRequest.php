<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Admin\Constants\AdminUserConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListAdminUsersRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:'.AdminUserConstants::SEARCH_MAX_LENGTH],
            'active' => ['nullable', 'boolean'],
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

    public function search(): string
    {
        return trim($this->string('search')->toString());
    }

    public function active(): ?bool
    {
        return $this->has('active') && $this->input('active') !== null ? $this->boolean('active') : null;
    }
}
