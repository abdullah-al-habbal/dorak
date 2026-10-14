<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Modules\Core\Enums\ErrorCodeEnum;
use Symfony\Component\HttpFoundation\Response;

final class ApiExceptionResponseHandler
{
    public function handle(Response $response, Request $request): Response
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
        $body = [
            'success' => false,
            'statusCode' => $status,
            'code' => $code->value,
            'message' => __($code->getMessageKey()),
            'timestamp' => Carbon::now()->toISOString(),
            'request_id' => $uuid,
        ];

        if (isset($payload['errors'])) {
            $body['errors'] = $payload['errors'];
        }

        return response()->json($body, $status, $response->headers->all());
    }

    private function errorCode(int $status): ErrorCodeEnum
    {
        return match ($status) {
            400 => ErrorCodeEnum::BAD_REQUEST,
            401 => ErrorCodeEnum::UNAUTHORIZED,
            403 => ErrorCodeEnum::FORBIDDEN,
            404 => ErrorCodeEnum::RESOURCE_NOT_FOUND,
            409 => ErrorCodeEnum::CONFLICT,
            422 => ErrorCodeEnum::VALIDATION_FAILED,
            429 => ErrorCodeEnum::TOO_MANY_REQUESTS,
            default => $status >= 500 ? ErrorCodeEnum::SERVER_ERROR : ErrorCodeEnum::UNPROCESSABLE_ENTITY,
        };
    }
}
