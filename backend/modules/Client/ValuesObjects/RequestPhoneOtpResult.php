<?php

declare(strict_types=1);

namespace Modules\Client\ValuesObjects;

final readonly class RequestPhoneOtpResult
{
    private function __construct(
        public ?string $failureReason,
    ) {}

    public static function sent(): self
    {
        return new self(failureReason: null);
    }

    public static function phoneInUse(): self
    {
        return new self(failureReason: 'phone_in_use');
    }

    public static function deliveryFailed(): self
    {
        return new self(failureReason: 'delivery_failed');
    }

    public function isDeliveryFailed(): bool
    {
        return $this->failureReason === 'delivery_failed';
    }

    public function isPhoneInUse(): bool
    {
        return $this->failureReason === 'phone_in_use';
    }
}
