<?php

declare(strict_types=1);

namespace Modules\Client\ValuesObjects;

use Modules\Client\Models\ClientModel;

final readonly class VerifyPhoneOtpResult
{
    private function __construct(
        public ?ClientModel $client,
        public ?string $failureReason,
    ) {}

    public static function success(ClientModel $client): self
    {
        return new self(client: $client, failureReason: null);
    }

    public static function invalidCode(): self
    {
        return new self(client: null, failureReason: 'invalid_code');
    }

    public static function phoneInUse(): self
    {
        return new self(client: null, failureReason: 'phone_in_use');
    }

    public function isInvalidCode(): bool
    {
        return $this->failureReason === 'invalid_code';
    }

    public function isPhoneInUse(): bool
    {
        return $this->failureReason === 'phone_in_use';
    }
}
