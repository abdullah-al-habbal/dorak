<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Modules\Core\Constants\FcmNotificationConstants;
use Modules\Core\Constants\LocaleConstants;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\FcmConfigurationProblemEnum;
use Modules\Core\Enums\NotificationDeliveryStatusEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Models\NotificationModel;
use Throwable;

final class FcmNotificationSender
{
    private bool $missingCredentialsWarningLogged = false;

    public function __construct(
        private readonly NotificationWriter $writer,
        private readonly FcmCredentialsResolver $credentialsResolver,
        private readonly NotificationRecipientLocale $recipientLocale,
        private readonly FcmPayloadBuilder $payloadBuilder,
        private readonly FcmInvalidTokenDetector $invalidTokenDetector,
    ) {}

    /**
     * Sends a text that is already written, the same in every language.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     */
    public function sendTo(
        string $userType,
        string $userId,
        NotificationTypeEnum $type,
        string $title,
        string $body,
        array $data,
        ?string $dispatchKey = null,
    ): NotificationModel {
        return $this->sendMessage($userType, $userId, $type, LocalizedNotificationMessage::fixed($title, $body), $data, $dispatchKey);
    }

    /**
     * Records the inbox notification in the account's stored language, then pushes it to each
     * registered device in that device's language (its registered locale, else the account's),
     * and records one delivery row per attempt. A dispatch key keeps a retried job from
     * duplicating the notification or re-pushing devices that already received it.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     */
    public function sendMessage(
        string $userType,
        string $userId,
        NotificationTypeEnum $type,
        LocalizedNotificationMessage $message,
        array $data,
        ?string $dispatchKey = null,
    ): NotificationModel {
        $alias = $this->writer->morphAlias($userType);
        $accountLocale = $this->accountLocale($alias, $userId);
        $notification = $this->writer->record($userType, $userId, $type, $message->title($accountLocale), $message->body($accountLocale), $data, $dispatchKey);

        $projectId = config('services.fcm.project_id');
        $credentials = is_string($projectId) && $projectId !== ''
            ? $this->credentialsResolver->resolve()
            : FcmConfigurationProblemEnum::ProjectIdMissing;

        if ($credentials instanceof FcmConfigurationProblemEnum) {
            $this->warnNotConfiguredOnce($credentials);

            return $notification;
        }

        $deliveredTokenIds = $this->writer->deliveredTokenIds($notification);
        $endpoint = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        DeviceTokenModel::query()
            ->where('user_type', $alias)
            ->where('user_id', $userId)
            ->whereNull('revoked_at')
            ->whereNotIn('id', $deliveredTokenIds)
            ->get()
            ->each(function (DeviceTokenModel $deviceToken) use ($notification, $endpoint, $credentials, $message, $data, $accountLocale): void {
                $locale = $deviceToken->locale ?? $accountLocale;
                $payload = $this->payloadBuilder->build($message->title($locale), $message->body($locale), $data, $locale, $deviceToken->platform_type);
                $this->pushToDevice($notification, $deviceToken, $endpoint, $credentials, $payload);
            });

        return $notification;
    }

    private function accountLocale(string $alias, string $userId): string
    {
        $type = DeviceTokenUserTypeEnum::tryFrom($alias);

        return $type === null ? LocaleConstants::CORE_DEFAULT_LOCALE : $this->recipientLocale->resolve($type, $userId);
    }

    private function warnNotConfiguredOnce(FcmConfigurationProblemEnum $problem): void
    {
        if ($this->missingCredentialsWarningLogged) {
            return;
        }

        Log::warning('FCM delivery skipped because project credentials are missing.', ['reason' => $problem->value]);
        $this->missingCredentialsWarningLogged = true;
    }

    /**
     * @param  array{client_email: string, private_key: string}  $credentials
     * @param  array<string, mixed>  $payload
     */
    private function pushToDevice(
        NotificationModel $notification,
        DeviceTokenModel $deviceToken,
        string $endpoint,
        array $credentials,
        array $payload,
    ): void {
        $token = $deviceToken->getAttribute('token');
        if (! is_string($token)) {
            return;
        }

        try {
            $response = Http::withToken($this->accessToken($credentials))
                ->retry(3, 100, fn (Throwable $exception, PendingRequest $request, ?string $method): bool => $this->isRetryable($exception),
                    throw: false,
                )
                ->post($endpoint, ['message' => ['token' => $token, ...$payload]]);

            $this->recordResponse($notification, $deviceToken, $response);
        } catch (Throwable $exception) {
            if ($this->isRetryable($exception)) {
                throw $exception;
            }

            $this->writer->recordDelivery($notification, $deviceToken->id, NotificationDeliveryStatusEnum::Failed, error: Str::limit($exception::class.': '.$exception->getMessage(), 1000));
            Log::warning('FCM device notification failed.', [
                'device_token_id' => $deviceToken->id,
                'exception' => $exception::class,
            ]);
        }
    }

    private function isRetryable(Throwable $exception): bool
    {
        return $exception instanceof RequestException
            && ($exception->response->status() === 429 || $exception->response->serverError());
    }

    private function recordResponse(NotificationModel $notification, DeviceTokenModel $deviceToken, Response $response): void
    {
        if ($response->successful()) {
            $messageId = $response->json('name');
            $this->writer->recordDelivery($notification, $deviceToken->id, NotificationDeliveryStatusEnum::Sent, is_string($messageId) ? $messageId : null);

            return;
        }

        $this->writer->recordDelivery($notification, $deviceToken->id, NotificationDeliveryStatusEnum::Failed, error: $this->errorSummary($response));

        if ($response->status() === 429 || $response->serverError()) {
            $response->throw();
        } elseif ($this->invalidTokenDetector->isDeadToken($response->status(), $response->json())) {
            $deviceToken->delete();
        } else {
            Log::warning('FCM rejected a device notification.', [
                'device_token_id' => $deviceToken->id,
                'status' => $response->status(),
            ]);
        }
    }

    private function errorSummary(Response $response): string
    {
        $error = $response->json('error');
        $summary = 'HTTP '.$response->status();
        if (is_array($error)) {
            $status = $error['status'] ?? null;
            $message = $error['message'] ?? null;
            $summary .= is_string($status) ? " {$status}" : '';
            $summary .= is_string($message) ? ": {$message}" : '';
        }

        return Str::limit($summary, 1000);
    }

    /**
     * @param  array{client_email: string, private_key: string}  $credentials
     */
    private function accessToken(array $credentials): string
    {
        $cacheKey = 'fcm:oauth-token:'.hash('sha256', $credentials['client_email'].$credentials['private_key']);
        $cachedToken = Cache::get($cacheKey);
        if (is_string($cachedToken) && $cachedToken !== '') {
            return $cachedToken;
        }

        $now = time();
        $assertion = $this->signedJwt([
            'iss' => $credentials['client_email'],
            'scope' => FcmNotificationConstants::FCM_NOTIFICATION_OAUTH_SCOPE,
            'aud' => FcmNotificationConstants::FCM_NOTIFICATION_GOOGLE_OAUTH_TOKEN_URL,
            'iat' => $now,
            'exp' => $now + 3600,
        ], $credentials['private_key']);

        $response = Http::asForm()->post(FcmNotificationConstants::FCM_NOTIFICATION_GOOGLE_OAUTH_TOKEN_URL, [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ])->throw();
        $accessToken = $response->json('access_token');
        if (! is_string($accessToken) || $accessToken === '') {
            throw new \RuntimeException('FCM OAuth response did not include an access token.');
        }
        $expiresInValue = $response->json('expires_in', 3600);
        $expiresIn = max(1, (is_numeric($expiresInValue) ? (int) $expiresInValue : 3600) - 60);
        Cache::put($cacheKey, $accessToken, Carbon::now()->addSeconds($expiresIn));

        return $accessToken;
    }

    /**
     * @param  array<string, int|string>  $claims
     */
    private function signedJwt(array $claims, string $privateKey): string
    {
        $header = $this->base64UrlEncode((string) json_encode(['alg' => 'RS256', 'typ' => 'JWT'], JSON_THROW_ON_ERROR));
        $payload = $this->base64UrlEncode((string) json_encode($claims, JSON_THROW_ON_ERROR));
        $unsigned = "{$header}.{$payload}";

        if (! openssl_sign($unsigned, $signature, $privateKey, OPENSSL_ALGO_SHA256) || ! is_string($signature)) {
            throw new \RuntimeException('Unable to sign FCM service-account assertion.');
        }

        return "{$unsigned}.".$this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
