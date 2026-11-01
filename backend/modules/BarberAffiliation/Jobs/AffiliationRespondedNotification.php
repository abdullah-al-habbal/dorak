<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class AffiliationRespondedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so the requester gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $affiliationId,
        private readonly bool $accepted,
        private readonly string $locale = 'en',
    ) {
        $this->dispatchKey = (string) Str::uuid();
    }

    public function handle(FcmNotificationSender $sender): void
    {
        $affiliation = BarberAffiliationModel::query()->find($this->affiliationId);
        if ($affiliation === null) {
            return;
        }

        $userType = match ($affiliation->initiated_by_type) {
            AffiliationInitiatorTypeEnum::Barber => BarberModel::class,
            AffiliationInitiatorTypeEnum::Branch => BranchModel::class,
            default => null,
        };
        if ($userType === null || $affiliation->initiated_by_id === null) {
            return;
        }

        $status = $this->accepted ? 'accepted' : 'rejected';
        $sender->sendTo(
            $userType,
            (string) $affiliation->initiated_by_id,
            NotificationTypeEnum::Invite,
            trans('barberaffiliation::messages.notification_responded_title', [], $this->locale),
            trans("barberaffiliation::messages.notification_responded_{$status}_body", [], $this->locale),
            ['type' => NotificationTypeEnum::Invite->value, 'event' => 'affiliation_responded', 'affiliation_id' => $affiliation->id, 'status' => $status],
            $this->dispatchKey,
        );
    }
}
