<?php

declare(strict_types=1);

namespace Modules\Feedback\Enums;

/** Which Dorak app or site the report came from. */
enum FeedbackAppEnum: string
{
    case Client = 'client';
    case Business = 'business';
    case Stylist = 'stylist';
    case Dashboard = 'dashboard';
    case Web = 'web';
}
