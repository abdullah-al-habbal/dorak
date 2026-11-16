<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Constants;

/** Limits for the images the admin attaches to a catalog item (FT-12). */
final class ServiceCatalogMediaConstants
{
    /** Kilobytes, Laravel's `max` unit. */
    public const int SERVICE_CATALOG_MEDIA_MAX_KB = 2048;

    public const string SERVICE_CATALOG_MEDIA_MIMES = 'jpeg,png,webp';

    /** Longest side in pixels, so a decompression bomb is refused before it is stored. */
    public const int SERVICE_CATALOG_MEDIA_MAX_SIDE = 4096;

    public const string SERVICE_CATALOG_MEDIA_DIRECTORY = 'catalog-media';

    public const int SERVICE_CATALOG_MEDIA_MAX_PER_ITEM = 10;
}
