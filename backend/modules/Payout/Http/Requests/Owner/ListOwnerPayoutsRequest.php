<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Requests\Owner;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListOwnerPayoutsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(PayoutStatus::class)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage)],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));
    }
}
