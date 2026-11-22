<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Modules\Admin\Models\AdminModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Enums\PlatformEventEnum;
use Throwable;

/**
 * NS-10: writes the dashboard inbox rows for platform events. A failed write never breaks the
 * business action that raised the event, so it is reported and swallowed.
 */
final class PlatformNotifier
{
    public function __construct(
        private readonly NotificationWriter $writer,
        private readonly NotificationRecipientLocale $recipientLocale,
    ) {}

    /** One row for every active platform admin. */
    public function toAdmins(PlatformEventEnum $event, string $subjectId): void
    {
        try {
            AdminModel::query()->whereNull('deactivated_at')->pluck('id')->each(
                fn (mixed $adminId) => $this->record(DeviceTokenUserTypeEnum::Admin, (string) $adminId, $event, $subjectId),
            );
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    public function toAccount(DeviceTokenUserTypeEnum $type, string $accountId, PlatformEventEnum $event, string $subjectId): void
    {
        try {
            $this->record($type, $accountId, $event, $subjectId);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function record(DeviceTokenUserTypeEnum $type, string $accountId, PlatformEventEnum $event, string $subjectId): void
    {
        $locale = $this->recipientLocale->resolve($type, $accountId);

        $this->writer->record(
            $type->modelClass(),
            $accountId,
            NotificationTypeEnum::PlatformEvent,
            $event->title($locale),
            $event->body($locale),
            ['type' => NotificationTypeEnum::PlatformEvent->value, 'event' => $event->value, 'subject_id' => $subjectId],
            "{$event->value}:{$subjectId}:".now()->format('YmdHi'),
        );
    }
}
