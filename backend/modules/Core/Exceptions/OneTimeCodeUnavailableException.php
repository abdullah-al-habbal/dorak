<?php

declare(strict_types=1);

namespace Modules\Core\Exceptions;

use Modules\Core\Enums\ErrorCodeEnum;
use Symfony\Component\HttpFoundation\Response;

/**
 * A one-time code couldn't be stored or burned (BG-28): its lock stayed busy or the cache refused the write. Work that
 * depends on the write must stop. The answer is 503, so the caller can try again.
 */
final class OneTimeCodeUnavailableException extends ApiErrorException
{
    public function __construct()
    {
        parent::__construct(__(ErrorCodeEnum::SERVICE_UNAVAILABLE->getMessageKey()));
    }

    public function errorCode(): string
    {
        return ErrorCodeEnum::SERVICE_UNAVAILABLE->value;
    }

    public function httpStatus(): int
    {
        return Response::HTTP_SERVICE_UNAVAILABLE;
    }
}
