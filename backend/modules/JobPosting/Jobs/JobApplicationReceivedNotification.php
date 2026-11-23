<?php

declare(strict_types=1);

namespace Modules\JobPosting\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;
use Modules\Core\Services\LocalizedNotificationMessage;
use Modules\JobPosting\Models\ApplicationModel;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class JobApplicationReceivedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so the branch gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $applicationId,
        private readonly string $locale = 'en',
    ) {
        $this->dispatchKey = (string) Str::uuid();
    }

    public function handle(FcmNotificationSender $sender): void
    {
        $application = ApplicationModel::query()->with('jobPosting')->find($this->applicationId);
        $branchId = $application?->jobPosting?->branch_id;
        if ($application === null || $branchId === null) {
            return;
        }

        $sender->sendMessage(
            BranchModel::class,
            (string) $branchId,
            NotificationTypeEnum::Application,
            LocalizedNotificationMessage::translated('jobposting::messages.notification_application_received_title', 'jobposting::messages.notification_application_received_body'),
            ['type' => NotificationTypeEnum::Application->value, 'event' => 'application_received', 'application_id' => $application->id, 'job_posting_id' => $application->job_posting_id],
            $this->dispatchKey,
        );
    }
}
