<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

use Modules\Dashboard\Enums\DashboardActorTypeEnum;

/**
 * A password change from the account page. The session that makes it (its
 * access token and, when the BFF sends it, its refresh token) stays signed in;
 * every other session of the account is ended.
 */
final readonly class UpdateDashboardPasswordCommand
{
    public function __construct(
        public string $currentPassword,
        public string $password,
        public DashboardActorTypeEnum $actorType,
        public int|string|null $keepAccessTokenId = null,
        public ?string $keepRefreshToken = null,
    ) {}
}
