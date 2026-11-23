<?php

declare(strict_types=1);

namespace Modules\Core\CQRS\Command\Shared;

use Modules\Core\Enums\DevicePlatformEnum;

final readonly class RegisterDeviceTokenCommand
{
    public function __construct(
        public string $token,
        public DevicePlatformEnum $platform,
        public ?string $locale,
        public ?string $appVersion,
        public int|string|null $accessTokenId,
    ) {}
}
