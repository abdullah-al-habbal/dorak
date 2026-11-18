<?php

declare(strict_types=1);

namespace Modules\Feedback\Enums;

/** What the sender wants: an idea, a problem report or help. */
enum FeedbackKindEnum: string
{
    case Suggestion = 'suggestion';
    case Bug = 'bug';
    case Support = 'support';
}
