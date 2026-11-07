<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;
use Modules\Subscription\Enums\SubscriptionStatus;

final class ListBrandSubscriptionsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(SubscriptionStatus::class)],
            'brand_id' => ['sometimes', 'uuid'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage)],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));
    }
}
