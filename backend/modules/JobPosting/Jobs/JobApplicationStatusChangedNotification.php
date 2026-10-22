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
use Modules\Barber\Models\BarberModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;
use Modules\JobPosting\Models\ApplicationModel;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class JobApplicationStatusChangedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so the barber gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $applicationId,
        private readonly string $locale = 'en',
    ) {
        $this->dispatchKey = (string) Str::uuid();
    }

    public function handle(FcmNotificationSender $sender): void
    {
        $application = ApplicationModel::query()->find($this->applicationId);
        if ($application === null) {
            return;
        }

        $status = $application->status->value;
        $sender->sendTo(
            BarberModel::class,
            (string) $application->barber_id,
            NotificationTypeEnum::Application,
            trans('jobposting::messages.notification_application_status_title', [], $this->locale),
            trans('jobposting::messages.notification_application_status_body', ['status' => $status], $this->locale),
            ['type' => NotificationTypeEnum::Application->value, 'event' => 'application_status_changed', 'application_id' => $application->id, 'job_posting_id' => $application->job_posting_id, 'status' => $status],
            $this->dispatchKey,
        );
    }
}
