<?php

declare(strict_types=1);

namespace Modules\Feedback\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Feedback\Database\Factories\FeedbackReportFactory;
use Modules\Feedback\Enums\FeedbackAppEnum;
use Modules\Feedback\Enums\FeedbackKindEnum;
use Modules\Feedback\Enums\FeedbackRelatedTypeEnum;
use Modules\Feedback\Enums\FeedbackStatusEnum;
use Modules\Feedback\Enums\FeedbackUserTypeEnum;

/**
 * One suggestion, bug report or support request. Three separate groups of columns: what was said (kind, message),
 * where it came from (app, platform, version, locale, screen, workflow, signed-in user) and the business record it is
 * about (related type and id). The source is never mixed into the related record, and no morph relation is used.
 */
#[Fillable([
    'kind', 'status', 'message', 'contact_email',
    'app', 'platform', 'app_version', 'locale', 'screen', 'workflow',
    'user_type', 'user_id',
    'related_type', 'related_id',
    'admin_note',
])]
#[Table('feedback_reports')]
final class FeedbackReportModel extends Model
{
    use HasFactory;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'kind' => FeedbackKindEnum::class,
            'status' => FeedbackStatusEnum::class,
            'app' => FeedbackAppEnum::class,
            'platform' => DevicePlatformEnum::class,
            'user_type' => FeedbackUserTypeEnum::class,
            'related_type' => FeedbackRelatedTypeEnum::class,
        ];
    }

    protected static function newFactory(): FeedbackReportFactory
    {
        return FeedbackReportFactory::new();
    }
}
