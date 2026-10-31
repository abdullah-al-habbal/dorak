<?php

declare(strict_types=1);

namespace Modules\Barber\Constants;

final class BarberEmailVerificationConstants
{
    public const int BARBER_EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;

    public const int BARBER_EMAIL_VERIFICATION_TTL_MINUTES = 10;
}
