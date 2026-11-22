<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class LocaleConstants
{
    /** Languages the dashboard UI and API can answer in, in preference order for a tie. */
    public const array CORE_REQUEST_LOCALES = ['en', 'ar'];

    /** The language used when a recipient has no stored preference. */
    public const string CORE_DEFAULT_LOCALE = 'en';
}
