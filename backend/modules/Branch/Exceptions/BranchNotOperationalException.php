<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

/** Decision A, point 4: a Disabled branch takes no walk-ins. Renders the stable 403 `branch_not_operational` error. */
final class BranchNotOperationalException extends ForbiddenApiException
{
    public const string CODE = 'branch_not_operational';

    public function __construct()
    {
        parent::__construct(__('branch::messages.not_operational'));
    }

    public function errorCode(): string
    {
        return self::CODE;
    }
}
