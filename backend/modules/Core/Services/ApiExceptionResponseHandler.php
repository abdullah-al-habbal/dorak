<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Modules\Core\Constants\ApiErrorConstants;
use Modules\Core\Enums\ErrorCodeEnum;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Throwable;

final class ApiExceptionResponseHandler
{
    public function handle(Response $response, Request $request, ?Throwable $exception = null): Response
    {
        $requestId = $request->attributes->get('request_uuid');
        $uuid = is_string($requestId) ? $requestId : '';
        $response->headers->set('X-Request-ID', $uuid);
        if ($response->getStatusCode() < 400 || ! $request->is('api/*')) {
            return $response;
        }

        $status = $response->getStatusCode();
        $code = $this->errorCode($status);
        $responsePayload = $response instanceof JsonResponse ? $response->getData(true) : [];
        $payload = is_array($responsePayload) ? $responsePayload : [];
        // A domain exception that renders its own stable `code` (e.g.
        // `feature_not_enabled`) keeps it and its translated message.
        $domainCode = isset($payload['code']) && is_string($payload['code']) && $payload['code'] !== '' ? $payload['code'] : null;
        $domainMessage = $domainCode !== null && is_string($payload['message'] ?? null) ? $payload['message'] : null;
        $body = [
            'success' => false,
            'statusCode' => $status,
            'code' => $domainCode ?? $code->value,
            'message' => $domainMessage ?? $this->specificMessage($exception) ?? __($code->getMessageKey()),
            'timestamp' => Carbon::now()->toISOString(),
            'request_id' => $uuid,
        ];

        if (isset($payload['errors'])) {
            $body['errors'] = $payload['errors'];
        }

        return response()->json($body, $status, $response->headers->all());
    }

    /**
     * The message a developer set on purpose (an authorization or conflict exception thrown with a
     * translated text). Framework texts such as "This action is unauthorized." or a route-not-found
     * sentence are not specific and fall back to the localized generic message.
     */
    private function specificMessage(?Throwable $exception): ?string
    {
        for ($current = $exception; $current !== null; $current = $current->getPrevious()) {
            $isDeliberate = $current instanceof AuthorizationException
                || $current instanceof AccessDeniedHttpException
                || $current instanceof ConflictHttpException;
            $message = $current->getMessage();
            if ($isDeliberate && $message !== '' && $message !== ApiErrorConstants::FRAMEWORK_UNAUTHORIZED_MESSAGE) {
                return $message;
            }
        }

        return null;
    }

    private function errorCode(int $status): ErrorCodeEnum
    {
        return match ($status) {
            400 => ErrorCodeEnum::BAD_REQUEST,
            401 => ErrorCodeEnum::UNAUTHORIZED,
            403 => ErrorCodeEnum::FORBIDDEN,
            404 => ErrorCodeEnum::RESOURCE_NOT_FOUND,
            405 => ErrorCodeEnum::METHOD_NOT_ALLOWED,
            409 => ErrorCodeEnum::CONFLICT,
            413 => ErrorCodeEnum::PAYLOAD_TOO_LARGE,
            422 => ErrorCodeEnum::VALIDATION_FAILED,
            429 => ErrorCodeEnum::TOO_MANY_REQUESTS,
            503 => ErrorCodeEnum::SERVICE_UNAVAILABLE,
            default => $status >= 500 ? ErrorCodeEnum::SERVER_ERROR : ErrorCodeEnum::UNPROCESSABLE_ENTITY,
        };
    }
}
