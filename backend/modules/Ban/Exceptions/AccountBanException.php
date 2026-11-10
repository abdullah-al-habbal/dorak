<?php

declare(strict_types=1);

namespace Modules\Ban\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** A ban move the account's current state does not allow. Renders a stable 409 API error. */
final class AccountBanException extends RuntimeException
{
    public const string CODE_ALREADY_BANNED = 'account_already_banned';

    public const string CODE_NOT_BANNED = 'account_not_banned';

    private function __construct(private readonly string $errorCode, string $messageKey)
    {
        parent::__construct(__($messageKey));
    }

    public static function alreadyBanned(): self
    {
        return new self(self::CODE_ALREADY_BANNED, 'ban::ui.account_already_banned');
    }

    public static function notBanned(): self
    {
        return new self(self::CODE_NOT_BANNED, 'ban::ui.account_not_banned');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'statusCode' => 409,
            'code' => $this->errorCode,
            'message' => $this->getMessage(),
            'timestamp' => now()->toIso8601String(),
        ], 409);
    }
}
