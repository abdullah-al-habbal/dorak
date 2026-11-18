<?php

declare(strict_types=1);

namespace Modules\Feedback\Enums;

/** The support workflow of one report. */
enum FeedbackStatusEnum: string
{
    case New = 'new';
    case Triaged = 'triaged';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';
    case Spam = 'spam';
}
