<?php

declare(strict_types=1);

namespace Modules\Payment\CQRS\Command;

use Modules\Payment\Enums\PaymentGatewayDriver;

final readonly class SavePaymentGatewayCommand
{
    /**
     * @param  array<string, string>  $name
     * @param  array<string, mixed>|null  $config  null keeps the stored config on update
     */
    public function __construct(
        public string $code,
        public array $name,
        public PaymentGatewayDriver $driver,
        public bool $isActive,
        public bool $isDefault,
        public ?array $config,
        public int $sortOrder,
    ) {}
}
