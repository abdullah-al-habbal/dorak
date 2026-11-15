<?php

declare(strict_types=1);

namespace Modules\Core\Exceptions;

use Illuminate\Http\JsonResponse;
use Modules\Core\Helpers\ApiResponseTrait;
use RuntimeException;

abstract class ApiErrorException extends RuntimeException
{
    use ApiResponseTrait;

    abstract public function errorCode(): string;

    abstract public function httpStatus(): int;

    protected function errorDetails(): mixed
    {
        return null;
    }

    public function render(): JsonResponse
    {
        return $this->error($this->errorCode(), $this->getMessage(), $this->httpStatus(), $this->errorDetails());
    }
}
