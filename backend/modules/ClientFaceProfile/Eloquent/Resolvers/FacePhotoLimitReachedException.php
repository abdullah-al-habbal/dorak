<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Eloquent\Resolvers;

use RuntimeException;

final class FacePhotoLimitReachedException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('A client may have at most 5 face profile photos.');
    }
}
