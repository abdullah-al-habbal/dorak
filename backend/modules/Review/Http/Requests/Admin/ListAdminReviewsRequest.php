<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\Enums\ReviewStatus;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListAdminReviewsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(ReviewStatus::class)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage)],
        ];
    }

    /** Moderation work is the disputed queue unless another status is asked for. */
    public function status(): ReviewStatus
    {
        return $this->enum('status', ReviewStatus::class) ?? ReviewStatus::Disputed;
    }

    public function perPage(): int
    {
        return $this->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));
    }
}
