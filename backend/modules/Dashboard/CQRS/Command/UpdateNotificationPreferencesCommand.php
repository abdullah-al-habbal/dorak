<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class UpdateNotificationPreferencesCommand
{
    /** @param array<string, bool> $preferences */
    public function __construct(public array $preferences) {}
}
