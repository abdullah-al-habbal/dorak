<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Modules\Core\Enums\NotificationDeliveryStatusEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Models\DeviceTokenModel;
use Modules\Core\Models\NotificationModel;
use Throwable;

final class FcmNotificationSender
{
    private const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

    private const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    private bool $missingCredentialsWarningLogged = false;

    public function __construct(
        private readonly NotificationWriter $writer,
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
        $credentials = $this->credentials();

        if (! is_string($projectId) || $projectId === '' || $credentials === null) {
            if (! $this->missingCredentialsWarningLogged) {
                Log::warning('FCM delivery skipped because project credentials are missing.');
                $this->missingCredentialsWarningLogged = true;
            }

            return $notification;
        }

        $alias = $this->writer->morphAlias($userType);
        $deliveredTokenIds = $this->writer->deliveredTokenIds($notification);

        DeviceTokenModel::query()
            ->whereIn('user_type', array_unique([$userType, $alias, Relation::getMorphedModel($alias) ?? $userType]))
            ->where('user_id', $userId)
            ->whereNotIn('id', $deliveredTokenIds)
            ->get()
            ->each(function (DeviceTokenModel $deviceToken) use ($notification, $projectId, $credentials, $title, $body, $data): void {
                $token = $deviceToken->getAttribute('token');
                if (! is_string($token)) {
                    return;
                }

                try {
                    $response = Http::withToken($this->accessToken($credentials))
                        ->retry(3, 100, fn (Throwable $exception, PendingRequest $request, ?string $method): bool => $exception instanceof RequestException
                            && ($exception->response->status() === 429 || $exception->response->serverError()),
                            throw: false,
                        )
                        ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                            'message' => [
                                'token' => $token,
                                'notification' => ['title' => $title, 'body' => $body],
                                'data' => (object) array_map(
                                    static fn (bool|float|int|string|null $value): string => is_scalar($value) ? (string) $value : '',
                                    $data,
                                ),
                            ],
                        ]);

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
                } catch (Throwable $exception) {
                    if ($exception instanceof RequestException
                        && ($exception->response->status() === 429 || $exception->response->serverError())) {
                        throw $exception;
                    }

                    $this->writer->recordDelivery($notification, $deviceToken->id, NotificationDeliveryStatusEnum::Failed, error: Str::limit($exception::class.': '.$exception->getMessage(), 1000));
                    Log::warning('FCM device notification failed.', [
                        'device_token_id' => $deviceToken->id,
                        'exception' => $exception::class,
                    ]);
                }
            });

        return $notification;
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
     * @return array{client_email: string, private_key: string}|null
     */
    private function credentials(): ?array
    {
        $configured = config('services.fcm.credentials');
        if (! is_string($configured) || $configured === '') {
            return null;
        }

        $json = str_starts_with(ltrim($configured), '{')
            ? $configured
            : (is_file($configured) ? file_get_contents($configured) : false);

        if (! is_string($json)) {
            return null;
        }

        $credentials = json_decode($json, true);

        if (! is_array($credentials)
            || ! is_string($credentials['client_email'] ?? null)
            || ! is_string($credentials['private_key'] ?? null)) {
            return null;
        }

        return [
            'client_email' => $credentials['client_email'],
            'private_key' => $credentials['private_key'],
        ];
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
            'scope' => self::FCM_SCOPE,
            'aud' => self::GOOGLE_OAUTH_TOKEN_URL,
            'iat' => $now,
            'exp' => $now + 3600,
        ], $credentials['private_key']);

        $response = Http::asForm()->post(self::GOOGLE_OAUTH_TOKEN_URL, [
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
