<?php

declare(strict_types=1);

namespace Modules\Activation\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

/** BG-3: a barber the platform admin switched off stays off until an admin switches them on. Renders the stable 403 `barber_deactivated_by_admin` error. */
final class BarberDeactivatedByAdminException extends ForbiddenApiException
{
    public const string CODE = 'barber_deactivated_by_admin';

    public function __construct()
    {
        parent::__construct(__('activation::messages.deactivated_by_admin'));
    }

    public function errorCode(): string
    {
        return self::CODE;
    }
}
