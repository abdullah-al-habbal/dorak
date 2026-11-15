<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

/** D8: a suspended brand can sign in and read, but may not create or change anything. Renders the stable 403 `brand_suspended` error. */
final class BrandSuspendedException extends ForbiddenApiException
{
    public const string CODE = 'brand_suspended';

    public function __construct()
    {
        parent::__construct(__('brand::messages.brand_suspended'));
    }

    public function errorCode(): string
    {
        return self::CODE;
    }
}
