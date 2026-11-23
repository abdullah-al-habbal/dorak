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
    ) {}

    /**
     * Records the inbox notification for the recipient, then pushes it to each
     * registered device and records one delivery row per attempt. A dispatch
     * key keeps a retried job from duplicating the notification or re-pushing
     * devices that already received it.
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
        $notification = $this->writer->record($userType, $userId, $type, $title, $body, $data, $dispatchKey);

        $projectId = config('services.fcm.project_id');
        $credentials = is_string($projectId) && $projectId !== ''
            ? $this->credentialsResolver->resolve()
            : FcmConfigurationProblemEnum::ProjectIdMissing;

        if ($credentials instanceof FcmConfigurationProblemEnum) {
            $this->warnNotConfiguredOnce($credentials);

            return $notification;
        }

        $alias = $this->writer->morphAlias($userType);
        $deliveredTokenIds = $this->writer->deliveredTokenIds($notification);
        $endpoint = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
        $payload = [
            'notification' => ['title' => $title, 'body' => $body],
            'data' => (object) array_map(
                static fn (bool|float|int|string|null $value): string => is_scalar($value) ? (string) $value : '',
                $data,
            ),
        ];

        DeviceTokenModel::query()
            ->where('user_type', $alias)
            ->where('user_id', $userId)
            ->whereNull('revoked_at')
            ->whereNotIn('id', $deliveredTokenIds)
            ->get()
            ->each(fn (DeviceTokenModel $deviceToken) => $this->pushToDevice($notification, $deviceToken, $endpoint, $credentials, $payload));

        return $notification;
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
     * @param  array{notification: array{title: string, body: string}, data: object}  $payload
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
        } elseif ($this->isInvalidTokenResponse($response->status(), $response->json())) {
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

    private function isInvalidTokenResponse(int $status, mixed $payload): bool
    {
        if ($status < 400 || ! is_array($payload)) {
            return false;
        }

        $error = $payload['error'] ?? null;
        if (! is_array($error)) {
            return false;
        }

        $details = $error['details'] ?? [];
        foreach (is_array($details) ? $details : [] as $detail) {
            if (! is_array($detail)) {
                continue;
            }

            if (($detail['@type'] ?? null) === 'type.googleapis.com/google.firebase.fcm.v1.FcmError'
                && in_array($detail['errorCode'] ?? null, ['UNREGISTERED', 'INVALID_ARGUMENT'], true)) {
                return true;
            }
        }

        return ($error['status'] ?? null) === 'UNREGISTERED'
            || ($error['status'] ?? null) === 'INVALID_ARGUMENT' && $this->errorMentionsToken($error);
    }

    private function errorMentionsToken(mixed $error): bool
    {
        if (! is_array($error)) {
            return false;
        }

        $message = $error['message'] ?? '';

        return is_string($message) && str_contains(strtolower($message), 'token');
    }
}
