<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

/** Locking of `OneTimeCodes`. A holder does one hash comparison and a few cache calls. */
final class OneTimeCodeConstants
{
    public const string LOCK_SUFFIX = ':lock';

    public const int LOCK_TTL_SECONDS = 10;

    public const int LOCK_WAIT_SECONDS = 5;
}
