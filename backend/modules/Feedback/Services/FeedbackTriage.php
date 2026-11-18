<?php

declare(strict_types=1);

namespace Modules\Feedback\Services;

use Illuminate\Support\Facades\DB;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Enums\StatusChangeSubjectTypeEnum;
use Modules\Audit\Services\StatusChangeLogger;
use Modules\Feedback\Enums\FeedbackStatusEnum;
use Modules\Feedback\Models\FeedbackReportModel;

/** Applies a triage step and logs a real status change with the admin who made it. */
final class FeedbackTriage
{
    public function __construct(
        private readonly StatusChangeLogger $logger,
    ) {}

    /** @param array{status: string, admin_note?: string|null} $changes */
    public function apply(FeedbackReportModel $report, array $changes, string $adminId): FeedbackReportModel
    {
        return DB::transaction(function () use ($report, $changes, $adminId): FeedbackReportModel {
            $locked = FeedbackReportModel::query()->whereKey($report->getKey())->lockForUpdate()->firstOrFail();
            $from = $locked->status;
            $to = FeedbackStatusEnum::from($changes['status']);

            $locked->status = $to;
            if (array_key_exists('admin_note', $changes)) {
                $locked->admin_note = $changes['admin_note'] === null ? null : trim($changes['admin_note']);
            }
            $locked->save();

            if ($from !== $to) {
                $this->logger->log(StatusChangeSubjectTypeEnum::FeedbackReport, (string) $locked->getKey(), $from->value, $to->value, StatusChangeActorTypeEnum::Admin, $adminId);
            }

            return $locked;
        });
    }
}
