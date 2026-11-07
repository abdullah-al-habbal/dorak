<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListSubscriptionPlansRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'is_active' => ['sometimes', 'boolean'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage)],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));
    }
}
