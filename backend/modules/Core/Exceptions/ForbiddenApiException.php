<?php

declare(strict_types=1);

namespace Modules\Core\Exceptions;

use Symfony\Component\HttpFoundation\Response;

abstract class ForbiddenApiException extends ApiErrorException
{
    final public function httpStatus(): int
    {
        return Response::HTTP_FORBIDDEN;
    }
}
