<?php

declare(strict_types=1);

namespace Modules\Settings\CQRS\Command;

final readonly class UpdatePlatformSettingsCommand
{
    /** @param  array<string, int>  $values  setting key => new value */
    public function __construct(public array $values) {}
}
