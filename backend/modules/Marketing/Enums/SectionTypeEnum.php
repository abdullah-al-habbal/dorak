<?php

declare(strict_types=1);

namespace Modules\Marketing\Enums;

enum SectionTypeEnum: string
{
    case Hero = 'hero';
    case FeatureList = 'feature_list';
    case FloorPlanDemo = 'floor_plan_demo';
    case Testimonials = 'testimonials';
    case Pricing = 'pricing';
    case Cta = 'cta';

    public function label(): string
    {
        return $this->value;
    }
}
