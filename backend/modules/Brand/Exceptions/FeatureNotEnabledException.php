<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Modules\Core\Exceptions\ForbiddenApiException;

/**
 * A premium brand feature is off (I2) or a branch is locked after a downgrade
 * (I3/EC-6). Renders the stable 403 `feature_not_enabled` API error.
 */
final class FeatureNotEnabledException extends ForbiddenApiException
{
    public function __construct(public readonly string $feature)
    {
        parent::__construct(__('brand::messages.feature_not_enabled', ['feature' => $feature]));
    }

    public function errorCode(): string
    {
        return 'feature_not_enabled';
    }

    protected function errorDetails(): mixed
    {
        return ['feature' => [$this->feature]];
    }
}
