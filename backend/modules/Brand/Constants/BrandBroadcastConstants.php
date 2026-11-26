<?php

declare(strict_types=1);

namespace Modules\Brand\Constants;

final class BrandBroadcastConstants
{
    public const string BRAND_SUSPENDED_EVENT_NAME = 'brand.suspended';

    public const string BRAND_PRIVATE_BRANCH_CHANNEL_PREFIX = 'branch.';

    public const string BRAND_PRIVATE_CLIENT_CHANNEL_PREFIX = 'client.';
}
