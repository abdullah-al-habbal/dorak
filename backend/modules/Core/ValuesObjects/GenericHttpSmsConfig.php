<?php

declare(strict_types=1);

namespace Modules\Core\ValuesObjects;

use InvalidArgumentException;
use JsonException;
use Modules\Core\Constants\SmsConstants;
use Modules\Core\Enums\SmsHttpFormatEnum;

final readonly class GenericHttpSmsConfig
{
    /**
     * @param  array<string, string>  $headers
     * @param  array<string, mixed>  $payloadTemplate
     */
    public function __construct(
        public string $url,
        public SmsHttpFormatEnum $format,
        public array $headers,
        public array $payloadTemplate,
        public int $timeoutSeconds,
    ) {}

    /**
     * @param  array<string, mixed>  $config  the `services.sms.http` config array
     */
    public static function fromConfig(array $config): self
    {
        $url = $config['url'] ?? null;

        if (! is_string($url) || ! preg_match('#^https?://#i', $url)) {
            throw new InvalidArgumentException('SMS_HTTP_URL must be an http(s) URL.');
        }

        $format = SmsHttpFormatEnum::tryFrom(self::stringOrEmpty($config['format'] ?? null))
            ?? SmsHttpFormatEnum::Json;

        $timeout = (int) ($config['timeout'] ?? 0);

        return new self(
            url: $url,
            format: $format,
            headers: array_map('strval', self::decodeObject($config['headers'] ?? null, 'SMS_HTTP_HEADERS', [])),
            payloadTemplate: self::decodeObject($config['payload'] ?? null, 'SMS_HTTP_PAYLOAD', SmsConstants::SMS_HTTP_DEFAULT_PAYLOAD),
            timeoutSeconds: $timeout > 0 ? $timeout : SmsConstants::SMS_HTTP_DEFAULT_TIMEOUT_SECONDS,
        );
    }

    private static function stringOrEmpty(mixed $value): string
    {
        return is_string($value) ? $value : '';
    }

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    private static function decodeObject(mixed $raw, string $envKey, array $default): array
    {
        if (! is_string($raw) || trim($raw) === '') {
            return $default;
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new InvalidArgumentException("{$envKey} must be a valid JSON object.");
        }

        if (! is_array($decoded) || array_is_list($decoded) && $decoded !== []) {
            throw new InvalidArgumentException("{$envKey} must be a valid JSON object.");
        }

        return $decoded;
    }
}
