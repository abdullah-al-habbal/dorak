<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Enums\FeedbackAppEnum;
use Modules\Feedback\Enums\FeedbackKindEnum;
use Modules\Feedback\Enums\FeedbackStatusEnum;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class ListFeedbackReportsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'kind' => ['sometimes', Rule::enum(FeedbackKindEnum::class)],
            'status' => ['sometimes', Rule::enum(FeedbackStatusEnum::class)],
            'app' => ['sometimes', Rule::enum(FeedbackAppEnum::class)],
            'platform' => ['sometimes', Rule::enum(DevicePlatformEnum::class)],
            'search' => ['sometimes', 'string', 'max:'.FeedbackConstants::FEEDBACK_SEARCH_MAX_LENGTH],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.app(SettingsService::class)->int(SettingKey::PaginationMaxPerPage)],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', app(SettingsService::class)->int(SettingKey::PaginationDefaultPerPage));
    }
}
