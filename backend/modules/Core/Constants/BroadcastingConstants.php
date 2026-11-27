<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class BroadcastingConstants
{
    public const string BROADCASTING_DEFAULT_CONNECTION = 'reverb';

    public const string BROADCASTING_DEFAULT_CLUSTER = 'mt1';

    public const int BROADCASTING_DEFAULT_PORT = 443;

    public const string BROADCASTING_SECURE_SCHEME = 'https';
}
