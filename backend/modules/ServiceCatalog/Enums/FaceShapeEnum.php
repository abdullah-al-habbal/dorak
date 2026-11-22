<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

enum FaceShapeEnum: string
{
    case Oval = 'oval';
    case Round = 'round';
    case Square = 'square';
    case Heart = 'heart';
    case Diamond = 'diamond';
    case Oblong = 'oblong';
    case Triangle = 'triangle';

    public function label(): string
    {
        return __('servicecatalog::enums.face_shape.'.$this->value);
    }
}
