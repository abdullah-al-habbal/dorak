<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Enums;

enum FaceAnalysisStatusEnum: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}
