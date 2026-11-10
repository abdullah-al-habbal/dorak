<?php

declare(strict_types=1);

namespace Modules\Ban\Constants;

/** NS-07: how the platform team bans and unbans clients. */
final class BanConstants
{
    public const string MANAGE_CLIENTS_ABILITY = 'manage-clients';

    public const int REASON_MIN_LENGTH = 3;

    public const int REASON_MAX_LENGTH = 500;
}
