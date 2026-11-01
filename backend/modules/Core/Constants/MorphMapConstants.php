<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\ClientInteraction\Enums\FavorableTypeEnum;
use Modules\ClientInteraction\Enums\InteractableTypeEnum;
use Modules\Core\Contracts\MorphAliasEnum;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\ServiceCatalog\Enums\MediableTypeEnum;

final class MorphMapConstants
{
    /**
     * Every enum whose cases are polymorphic type aliases. Their alias => model
     * pairs are merged into the global morph map at boot.
     *
     * @var list<class-string<MorphAliasEnum>>
     */
    public const array MORPH_ALIAS_ENUMS = [
        ActivableTypeEnum::class,
        AffiliableType::class,
        AffiliationInitiatorTypeEnum::class,
        BannableTypeEnum::class,
        DeviceTokenUserTypeEnum::class,
        FavorableTypeEnum::class,
        InteractableTypeEnum::class,
        MediableTypeEnum::class,
        PreferenceableTypeEnum::class,
        ReviewAuthorTypeEnum::class,
        ReviewSubjectTypeEnum::class,
        ServiceableTypeEnum::class,
        StatusChangeSubjectTypeEnum::class,
    ];
}
