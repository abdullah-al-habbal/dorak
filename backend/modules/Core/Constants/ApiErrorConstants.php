<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class ApiErrorConstants
{
    /** Laravel's own text for a denied gate or policy, which is not a deliberate message. */
    public const string FRAMEWORK_UNAUTHORIZED_MESSAGE = 'This action is unauthorized.';
}
