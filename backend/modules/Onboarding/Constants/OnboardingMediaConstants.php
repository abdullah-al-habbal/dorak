<?php

declare(strict_types=1);

namespace Modules\Onboarding\Constants;

/** Limits for the hero image the admin replaces on an onboarding screen (FT-13). */
final class OnboardingMediaConstants
{
    /** Kilobytes, Laravel's `max` unit. */
    public const int ONBOARDING_MEDIA_MAX_KB = 2048;

    public const string ONBOARDING_MEDIA_MIMES = 'jpeg,png,webp';

    /** Longest side in pixels. */
    public const int ONBOARDING_MEDIA_MAX_SIDE = 4096;

    /** Uploaded heroes live here; the seeded ones are under `onboarding/`, which an upload never deletes. */
    public const string ONBOARDING_MEDIA_DIRECTORY = 'onboarding-uploads';
}
