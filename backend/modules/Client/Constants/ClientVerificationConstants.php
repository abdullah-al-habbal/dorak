<?php

declare(strict_types=1);

namespace Modules\Client\Constants;

final class ClientVerificationConstants
{
    /** How long a client's email or phone code stays valid. */
    public const int CODE_TTL_MINUTES = 10;
}
