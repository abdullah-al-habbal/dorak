<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Modules\Core\Enums\ErrorCodeEnum;
use RuntimeException;

final class AffiliationResponseException extends RuntimeException
{
    private function __construct(public readonly ErrorCodeEnum $errorCode, string $message)
    {
        parent::__construct($message);
    }

    public static function ownInvite(): self
    {
        return new self(ErrorCodeEnum::FORBIDDEN, __('barberaffiliation::messages.cannot_accept_own_invite'));
    }

    public static function notPending(): self
    {
        return new self(ErrorCodeEnum::BAD_REQUEST, __('branch::messages.affiliation_not_pending'));
    }
}
