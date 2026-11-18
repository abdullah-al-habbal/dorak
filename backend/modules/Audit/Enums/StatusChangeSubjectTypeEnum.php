<?php

declare(strict_types=1);

namespace Modules\Audit\Enums;

use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Contracts\MorphAliasEnum;
use Modules\JobPosting\Models\ApplicationModel;
use Modules\Marketing\Models\MarketingPageModel;

enum StatusChangeSubjectTypeEnum: string implements MorphAliasEnum
{
    case Booking = 'booking';
    case Affiliation = 'affiliation';
    case Brand = 'brand';
    case Branch = 'branch';
    case JobApplication = 'job_application';
    case MarketingPage = 'marketing_page';

    public function modelClass(): string
    {
        return match ($this) {
            self::Booking => BookingModel::class,
            self::Affiliation => BarberAffiliationModel::class,
            self::Brand => BrandModel::class,
            self::Branch => BranchModel::class,
            self::JobApplication => ApplicationModel::class,
            self::MarketingPage => MarketingPageModel::class,
        };
    }
}
