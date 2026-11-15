<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Modules\Core\Exceptions\ConflictApiException;

/** A brand lifecycle move the brand's current state does not allow. Renders a stable 409 API error. */
final class BrandReviewException extends ConflictApiException
{
    public const string CODE_NOT_PENDING = 'brand_not_pending';

    public const string CODE_NOT_REJECTED = 'brand_not_rejected';

    public const string CODE_NOT_ACTIVE = 'brand_not_active';

    public const string CODE_NOT_SUSPENDED = 'brand_not_suspended';

    public const string CODE_RESUBMISSION_LIMIT = 'brand_resubmission_limit';

    private function __construct(private readonly string $errorCode, string $messageKey)
    {
        parent::__construct(__($messageKey));
    }

    public static function notPending(): self
    {
        return new self(self::CODE_NOT_PENDING, 'brand::messages.review_not_pending');
    }

    public static function notRejected(): self
    {
        return new self(self::CODE_NOT_REJECTED, 'brand::messages.review_not_rejected');
    }

    public static function notActive(): self
    {
        return new self(self::CODE_NOT_ACTIVE, 'brand::messages.review_not_active');
    }

    public static function notSuspended(): self
    {
        return new self(self::CODE_NOT_SUSPENDED, 'brand::messages.review_not_suspended');
    }

    public static function resubmissionLimit(): self
    {
        return new self(self::CODE_RESUBMISSION_LIMIT, 'brand::messages.review_resubmission_limit');
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }
}
