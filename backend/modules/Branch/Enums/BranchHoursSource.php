<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

/** Where a branch's effective hours for a date come from. */
enum BranchHoursSource: string
{
    case Weekly = 'weekly';
    case Override = 'override';
}
