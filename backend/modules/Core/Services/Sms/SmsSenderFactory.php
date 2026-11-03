<?php

declare(strict_types=1);

namespace Modules\Core\Services\Sms;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use InvalidArgumentException;
use Modules\Core\Contracts\SmsSender;
use Modules\Core\Enums\SmsDriverEnum;
use Modules\Core\ValuesObjects\GenericHttpSmsConfig;

/**
 * Resolves the configured SmsSender strategy. Adding a gateway means adding
 * a SmsDriverEnum case, a SmsSender implementation and one match arm here.
 */
final class SmsSenderFactory
{
    public function __construct(private readonly ConfigRepository $config) {}

    public function make(): SmsSender
    {
        $driver = $this->config->get('services.sms.driver');
        $driver = is_string($driver) ? SmsDriverEnum::tryFrom($driver) : null;

        return match ($driver) {
            SmsDriverEnum::Log => new LogSmsSender,
            SmsDriverEnum::GenericHttp => new GenericHttpSmsSender(
                GenericHttpSmsConfig::fromConfig((array) $this->config->get('services.sms.http')),
            ),
            null => throw new InvalidArgumentException('Unsupported SMS driver.'),
        };
    }
}
