<?php

declare(strict_types=1);

namespace Modules\Branch\Constants;

final class BranchTimeZoneConstants
{
    /** Used by a branch with no zone of its own, and by a booking with no branch (owner, 2026-11-27). */
    public const string BRANCH_DEFAULT_TIME_ZONE = 'Asia/Damascus';
}
