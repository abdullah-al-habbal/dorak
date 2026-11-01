<?php

declare(strict_types=1);

namespace Modules\Client\CQRS\Command\Client;

use Modules\Client\Enums\SocialProviderEnum;

final readonly class SocialLoginCommand
{
    public function __construct(
        public SocialProviderEnum $provider,
        public string $accessToken,
    ) {}
}
