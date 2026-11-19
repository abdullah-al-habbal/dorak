<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Contracts\Foundation\Application;
use Modules\Core\Constants\DeliveryGuardConstants;
use Modules\Core\Enums\SmsDriverEnum;
use Modules\Core\Exceptions\UnsafeDeliveryConfigurationException;

/**
 * Refuses to boot in production when SMS or mail would be logged instead of delivered: users would never get
 * their sign-in and reset codes. Only an explicit unsafe value trips it, so an unset value (for example while
 * building an image) does not.
 */
final class ProductionDeliveryGuard
{
    public function __construct(
        private readonly Application $app,
        private readonly ConfigRepository $config,
    ) {}

    public function assertSafe(): void
    {
        if (! $this->app->isProduction()) {
            return;
        }

        $problems = [];

        if ($this->config->get('services.sms.driver') === SmsDriverEnum::Log->value) {
            $problems[] = 'SMS_DRIVER is "log"; use a real gateway such as "generic_http"';
        }

        $mailer = $this->config->get('mail.default');
        if (is_string($mailer) && in_array($mailer, DeliveryGuardConstants::DELIVERY_GUARD_UNSAFE_MAILERS, true)) {
            $problems[] = "MAIL_MAILER is \"{$mailer}\"; use a real transport";
        }

        if ($problems !== []) {
            throw new UnsafeDeliveryConfigurationException(
                'Refusing to boot in production: '.implode('; ', $problems).'.',
            );
        }
    }
}
