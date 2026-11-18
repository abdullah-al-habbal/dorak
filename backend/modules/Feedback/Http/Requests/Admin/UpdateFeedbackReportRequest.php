<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Enums\FeedbackStatusEnum;

/** Triage: set the status and, optionally, an internal note. Nothing the sender wrote can be edited. */
final class UpdateFeedbackReportRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(FeedbackStatusEnum::class)],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:'.FeedbackConstants::FEEDBACK_ADMIN_NOTE_MAX_LENGTH],
        ];
    }
}
