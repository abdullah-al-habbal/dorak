<?php

declare(strict_types=1);

namespace Modules\Client\Constants;

final class ClientPasswordResetConstants
{
    public const int CLIENT_PASSWORD_RESET_MAX_ATTEMPTS = 5;

    public const int CLIENT_PASSWORD_RESET_TTL_MINUTES = 10;
}
