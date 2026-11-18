<?php

declare(strict_types=1);

namespace Modules\Feedback\Constants;

final class FeedbackConstants
{
    public const int FEEDBACK_MESSAGE_MIN_LENGTH = 5;

    public const int FEEDBACK_MESSAGE_MAX_LENGTH = 2000;

    public const int FEEDBACK_ADMIN_NOTE_MAX_LENGTH = 2000;

    public const int FEEDBACK_EMAIL_MAX_LENGTH = 255;

    public const int FEEDBACK_VERSION_MAX_LENGTH = 32;

    public const int FEEDBACK_CONTEXT_KEY_MAX_LENGTH = 64;

    public const int FEEDBACK_RELATED_ID_MAX_LENGTH = 64;

    public const int FEEDBACK_SEARCH_MAX_LENGTH = 100;

    /** A screen, workflow or feature key: lowercase words joined by `_`, `-`, `.` or `/`, so no free text or markup. */
    public const string FEEDBACK_CONTEXT_KEY_PATTERN = '/^[a-z0-9][a-z0-9_.\/-]*$/';

    /** Dotted app version such as `1.4.2` or `1.4.2+17`. */
    public const string FEEDBACK_VERSION_PATTERN = '/^[0-9A-Za-z][0-9A-Za-z.+_-]*$/';

    /** Honeypot: real clients never send it; a bot that fills every field does. */
    public const string FEEDBACK_HONEYPOT_FIELD = 'website';

    public const string FEEDBACK_SUBMIT_LIMITER = 'feedback-submit';

    public const string FEEDBACK_DAILY_LIMITER = 'feedback-daily';

    public const int FEEDBACK_SUBMIT_PER_MINUTE = 5;

    public const int FEEDBACK_SUBMIT_PER_DAY = 30;
}
