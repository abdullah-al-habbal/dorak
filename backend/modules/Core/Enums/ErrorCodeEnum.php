<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

use Illuminate\Http\Response;

enum ErrorCodeEnum: string
{
    case BAD_REQUEST = 'BAD_REQUEST';
    case VALIDATION_FAILED = 'VALIDATION_FAILED';
    case UNAUTHORIZED = 'UNAUTHORIZED';
    case FORBIDDEN = 'FORBIDDEN';
    case RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';
    case METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';
    case CONFLICT = 'CONFLICT';
    case PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE';
    case UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY';
    case TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';
    case SERVER_ERROR = 'SERVER_ERROR';
    case SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE';
    case ACCOUNT_NOT_ACTIVE = 'ACCOUNT_NOT_ACTIVE';
    case ACCOUNT_BANNED = 'ACCOUNT_BANNED';
    case TOKEN_ABILITY_MISSING = 'TOKEN_ABILITY_MISSING';

    public function getStatusCode(): int
    {
        return match ($this) {
            self::BAD_REQUEST => Response::HTTP_BAD_REQUEST,
            self::VALIDATION_FAILED => Response::HTTP_UNPROCESSABLE_ENTITY,
            self::UNAUTHORIZED => Response::HTTP_UNAUTHORIZED,
            self::FORBIDDEN => Response::HTTP_FORBIDDEN,
            self::RESOURCE_NOT_FOUND => Response::HTTP_NOT_FOUND,
            self::METHOD_NOT_ALLOWED => Response::HTTP_METHOD_NOT_ALLOWED,
            self::CONFLICT => Response::HTTP_CONFLICT,
            self::PAYLOAD_TOO_LARGE => Response::HTTP_REQUEST_ENTITY_TOO_LARGE,
            self::UNPROCESSABLE_ENTITY => Response::HTTP_UNPROCESSABLE_ENTITY,
            self::TOO_MANY_REQUESTS => Response::HTTP_TOO_MANY_REQUESTS,
            self::SERVER_ERROR => Response::HTTP_INTERNAL_SERVER_ERROR,
            self::SERVICE_UNAVAILABLE => Response::HTTP_SERVICE_UNAVAILABLE,
            self::ACCOUNT_NOT_ACTIVE, self::ACCOUNT_BANNED, self::TOKEN_ABILITY_MISSING => Response::HTTP_FORBIDDEN,
        };
    }

    public function getMessageKey(): string
    {
        return match ($this) {
            self::BAD_REQUEST => 'core::messages.bad_request',
            self::VALIDATION_FAILED => 'core::messages.validation_failed',
            self::UNAUTHORIZED => 'core::messages.unauthorized',
            self::FORBIDDEN => 'core::messages.forbidden',
            self::RESOURCE_NOT_FOUND => 'core::messages.not_found',
            self::METHOD_NOT_ALLOWED => 'core::messages.method_not_allowed',
            self::CONFLICT => 'core::messages.conflict',
            self::PAYLOAD_TOO_LARGE => 'core::messages.payload_too_large',
            self::UNPROCESSABLE_ENTITY => 'core::messages.unprocessable',
            self::TOO_MANY_REQUESTS => 'core::messages.too_many_requests',
            self::SERVER_ERROR => 'core::messages.server_error',
            self::SERVICE_UNAVAILABLE => 'core::messages.service_unavailable',
            self::ACCOUNT_NOT_ACTIVE => 'activation::messages.account_not_active',
            self::ACCOUNT_BANNED => 'ban::ui.account_banned',
            self::TOKEN_ABILITY_MISSING => 'core::messages.token_ability_missing',
        };
    }
}
