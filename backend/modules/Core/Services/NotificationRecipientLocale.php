<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Modules\Core\Constants\LocaleConstants;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\Locale;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

/**
 * The language a notification is written in: the recipient's stored
 * `preferences.preferred_language`, or the default language when the account
 * has no preference row or no supported value. The request that raises the
 * event belongs to another actor, so its locale is never used.
 */
final class NotificationRecipientLocale
{
    public function resolve(DeviceTokenUserTypeEnum $type, string $accountId): string
    {
        $stored = PreferenceModel::query()
            ->toBase()
            ->where('preferenceable_type', $this->ownerType($type)->value)
            ->where('preferenceable_id', $accountId)
            ->value('preferred_language');

        return Locale::tryFrom(is_string($stored) ? $stored : '')?->value ?? LocaleConstants::CORE_DEFAULT_LOCALE;
    }

    private function ownerType(DeviceTokenUserTypeEnum $type): PreferenceableTypeEnum
    {
        return match ($type) {
            DeviceTokenUserTypeEnum::Admin => PreferenceableTypeEnum::Admin,
            DeviceTokenUserTypeEnum::Branch => PreferenceableTypeEnum::Branch,
            DeviceTokenUserTypeEnum::Barber => PreferenceableTypeEnum::Barber,
            DeviceTokenUserTypeEnum::Client => PreferenceableTypeEnum::Client,
        };
    }
}
