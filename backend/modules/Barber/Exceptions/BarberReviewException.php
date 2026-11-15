<?php

declare(strict_types=1);

namespace Modules\Barber\Exceptions;

use Modules\Core\Exceptions\ConflictApiException;

/** A review transition the barber's current state does not allow. Renders a stable 409 API error. */
final class BarberReviewException extends ConflictApiException
{
    public const string CODE_NOT_PENDING = 'barber_not_pending';

    public const string CODE_NOT_REJECTED = 'barber_not_rejected';

    public const string CODE_RESUBMISSION_LIMIT = 'barber_resubmission_limit';

    private function __construct(private readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }

    public static function notPending(): self
    {
        return new self(self::CODE_NOT_PENDING, __('barber::messages.review_not_pending'));
    }

    public static function notRejected(): self
    {
        return new self(self::CODE_NOT_REJECTED, __('barber::messages.review_not_rejected'));
    }

    public static function resubmissionLimit(): self
    {
        return new self(self::CODE_RESUBMISSION_LIMIT, __('barber::messages.review_resubmission_limit'));
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }
}
