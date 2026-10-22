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
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Services\FcmNotificationSender;

#[Backoff([10, 30, 60])]
#[Tries(4)]
final class AffiliationInvitedNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Stable across queue retries so the recipient gets one inbox row. */
    public readonly string $dispatchKey;

    public function __construct(
        private readonly string $affiliationId,
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

        $data = ['type' => NotificationTypeEnum::Invite->value, 'event' => 'affiliation_invited', 'affiliation_id' => $affiliation->id];
        $title = trans('barberaffiliation::messages.notification_invited_title', [], $this->locale);

        if (AffiliationParty::isBarber($affiliation->initiated_by_type)) {
            // The barber asked to join; only branches can receive the request.
            if ($affiliation->affiliable_type !== AffiliableType::Branch) {
                return;
            }
            $sender->sendTo(BranchModel::class, (string) $affiliation->affiliable_id, NotificationTypeEnum::Invite, $title, trans('barberaffiliation::messages.notification_invited_branch_body', [], $this->locale), $data, $this->dispatchKey);

            return;
        }

        $sender->sendTo(BarberModel::class, (string) $affiliation->barber_id, NotificationTypeEnum::Invite, $title, trans('barberaffiliation::messages.notification_invited_barber_body', [], $this->locale), $data, $this->dispatchKey);
    }
}
