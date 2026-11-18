<?php

declare(strict_types=1);

namespace Modules\Feedback\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Enums\FeedbackAppEnum;
use Modules\Feedback\Enums\FeedbackKindEnum;
use Modules\Feedback\Enums\FeedbackRelatedTypeEnum;
use Modules\Feedback\Services\FeedbackAuthorResolver;

/** A suggestion, bug report or support request from any app or the public site. Guests must leave an email to be answered. */
final class StoreFeedbackRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $guest = app(FeedbackAuthorResolver::class)->resolve($this) === null;

        return [
            'kind' => ['required', Rule::enum(FeedbackKindEnum::class)],
            'message' => ['required', 'string', 'min:'.FeedbackConstants::FEEDBACK_MESSAGE_MIN_LENGTH, 'max:'.FeedbackConstants::FEEDBACK_MESSAGE_MAX_LENGTH],
            'contact_email' => [Rule::requiredIf($guest), 'nullable', 'email:rfc', 'max:'.FeedbackConstants::FEEDBACK_EMAIL_MAX_LENGTH],
            'app' => ['required', Rule::enum(FeedbackAppEnum::class)],
            'platform' => ['required', Rule::enum(DevicePlatformEnum::class)],
            'app_version' => ['nullable', 'string', 'max:'.FeedbackConstants::FEEDBACK_VERSION_MAX_LENGTH, 'regex:'.FeedbackConstants::FEEDBACK_VERSION_PATTERN],
            'locale' => ['nullable', 'string', Rule::in(['ar', 'en'])],
            'screen' => ['nullable', 'string', 'max:'.FeedbackConstants::FEEDBACK_CONTEXT_KEY_MAX_LENGTH, 'regex:'.FeedbackConstants::FEEDBACK_CONTEXT_KEY_PATTERN],
            'workflow' => ['nullable', 'string', 'max:'.FeedbackConstants::FEEDBACK_CONTEXT_KEY_MAX_LENGTH, 'regex:'.FeedbackConstants::FEEDBACK_CONTEXT_KEY_PATTERN],
            'related_type' => ['nullable', 'required_with:related_id', Rule::enum(FeedbackRelatedTypeEnum::class)],
            'related_id' => ['nullable', 'required_with:related_type', 'string', 'max:'.FeedbackConstants::FEEDBACK_RELATED_ID_MAX_LENGTH, 'regex:/^[0-9A-Za-z-]+$/'],
            FeedbackConstants::FEEDBACK_HONEYPOT_FIELD => ['nullable', 'string', 'max:255'],
        ];
    }

    /** A filled honeypot means a bot: the answer looks like success, but nothing is stored. */
    public function isSpam(): bool
    {
        return trim((string) $this->input(FeedbackConstants::FEEDBACK_HONEYPOT_FIELD)) !== '';
    }

    /** @return array<string, mixed> */
    public function report(): array
    {
        return array_map(
            fn (mixed $value): mixed => is_string($value) ? trim($value) : $value,
            $this->safe()->except([FeedbackConstants::FEEDBACK_HONEYPOT_FIELD]),
        );
    }
}
