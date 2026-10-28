<?php

declare(strict_types=1);

namespace Modules\Commission\CQRS\Command;

use Modules\Commission\Enums\CommissionScope;
use Modules\Commission\Enums\CommissionType;

final readonly class SaveCommissionRuleCommand
{
    public function __construct(
        public CommissionScope $scope,
        public ?string $scopeId,
        public CommissionType $type,
        public int $value,
        public ?string $currencyId,
        public bool $isActive,
        public ?string $notes,
    ) {}
}
