<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListClientsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['nullable', Rule::enum(ClientStatusEnum::class)],
            'banned' => ['nullable', 'boolean'],
            'search' => ['nullable', 'string', 'max:'.DashboardBrandConstants::DASHBOARD_BRAND_SEARCH_MAX_LENGTH],
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

    public function status(): ?ClientStatusEnum
    {
        return $this->enum('status', ClientStatusEnum::class);
    }

    public function banned(): ?bool
    {
        return $this->has('banned') && $this->input('banned') !== null ? $this->boolean('banned') : null;
    }

    public function search(): string
    {
        return trim($this->string('search')->toString());
    }
}
