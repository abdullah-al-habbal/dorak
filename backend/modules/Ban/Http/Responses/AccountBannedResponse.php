<?php

declare(strict_types=1);

namespace Modules\Ban\Http\Responses;

use Illuminate\Http\JsonResponse;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Helpers\ApiResponseTrait;

/** The 403 `ACCOUNT_BANNED` answer shared by the ban middleware and the dashboard session check. */
final class AccountBannedResponse
{
    use ApiResponseTrait;

    public static function make(): JsonResponse
    {
        return (new self)->error(ErrorCodeEnum::ACCOUNT_BANNED);
    }
}
