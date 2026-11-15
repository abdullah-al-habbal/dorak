<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

/** Decision A: a suspended branch can be read but not changed. Renders the stable 403 `branch_read_only` error. */
final class BranchReadOnlyException extends ForbiddenApiException
{
    public const string CODE = 'branch_read_only';

    public function __construct()
    {
        parent::__construct(__('branch::messages.read_only'));
    }

    public function errorCode(): string
    {
        return self::CODE;
    }
}
