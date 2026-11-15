<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

final class BrandNotApprovedException extends ForbiddenApiException
{
    public const string CODE = 'brand_not_approved';

    public function __construct()
    {
        parent::__construct(__('brand::messages.brand_not_approved'));
    }

    public function errorCode(): string
    {
        return self::CODE;
    }
}
