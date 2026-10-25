<?php

declare(strict_types=1);

namespace Modules\ClientHistory\CQRS\Command;

final readonly class UpdateClientHistoryCommand
{
    /** @param  array<string, mixed>  $attributes */
    public function __construct(
        public string $historyId,
        public array $attributes,
    ) {}
}
