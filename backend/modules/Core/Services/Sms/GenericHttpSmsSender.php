<?php

declare(strict_types=1);

namespace Modules\Core\Services\Sms;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Modules\Core\Constants\SmsConstants;
use Modules\Core\Contracts\SmsSender;
use Modules\Core\Enums\SmsHttpFormatEnum;
use Modules\Core\Exceptions\SmsDeliveryException;
use Modules\Core\ValuesObjects\GenericHttpSmsConfig;

/**
 * Posts each SMS to a configurable HTTP endpoint (WhatsApp bridge, local
 * gateway, webhook). Headers and payload shape come from configuration;
 * `{{phone}}` and `{{message}}` placeholders are substituted in payload values.
 */
final class GenericHttpSmsSender implements SmsSender
{
    public function __construct(private readonly GenericHttpSmsConfig $config) {}

    public function send(string $phone, string $message): void
    {
        try {
            $response = $this->request()->post($this->config->url, $this->payload($phone, $message));
        } catch (ConnectionException $exception) {
            throw SmsDeliveryException::unreachable($exception);
        }

        if ($response->failed()) {
            throw SmsDeliveryException::rejected($response->status());
        }
    }

    private function request(): PendingRequest
    {
        $request = Http::withHeaders($this->config->headers)
            ->timeout($this->config->timeoutSeconds)
            ->connectTimeout(SmsConstants::SMS_HTTP_CONNECT_TIMEOUT_SECONDS);

        return $this->config->format === SmsHttpFormatEnum::Form ? $request->asForm() : $request->asJson();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $phone, string $message): array
    {
        return $this->substitute($this->config->payloadTemplate, [
            SmsConstants::SMS_PLACEHOLDER_PHONE => $phone,
            SmsConstants::SMS_PLACEHOLDER_MESSAGE => $message,
        ]);
    }

    /**
     * @param  array<array-key, mixed>  $template
     * @param  array<string, string>  $replacements
     * @return array<array-key, mixed>
     */
    private function substitute(array $template, array $replacements): array
    {
        return array_map(fn (mixed $value): mixed => match (true) {
            is_array($value) => $this->substitute($value, $replacements),
            is_string($value) => strtr($value, $replacements),
            default => $value,
        }, $template);
    }
}
