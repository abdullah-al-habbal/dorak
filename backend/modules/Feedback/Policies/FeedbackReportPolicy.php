<?php

declare(strict_types=1);

namespace Modules\Feedback\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Feedback\Models\FeedbackReportModel;

/** Reports hold contact details and free text from users: only a platform admin reads or triages them. */
final class FeedbackReportPolicy
{
    public function viewAny(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function view(mixed $actor, FeedbackReportModel $report): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor, FeedbackReportModel $report): bool
    {
        return $actor instanceof AdminModel;
    }
}
