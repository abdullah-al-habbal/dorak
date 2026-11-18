<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class UploadConstants
{
    /** Longest side, in pixels, accepted for a user-uploaded photo. Guards against decompression bombs; phone cameras stay well under it. */
    public const int UPLOAD_PHOTO_MAX_SIDE = 12000;

    private function __construct() {}
}
