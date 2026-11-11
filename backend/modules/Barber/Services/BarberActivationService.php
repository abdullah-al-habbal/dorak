<?php

declare(strict_types=1);

namespace Modules\Barber\Services;

use Illuminate\Support\Facades\DB;
use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Exceptions\BarberActivationException;
use Modules\Barber\Models\BarberModel;

/**
 * NS-08: the platform admin switches an approved barber off and on. Pending and rejected barbers
 * go through the review queue (NS-30), not through here. Each move is logged with the admin and reason.
 */
final class BarberActivationService
{
    public function deactivate(string $barberId, AdminModel $admin, ?string $reason): BarberModel
    {
        return $this->move($barberId, BarberStatusEnum::Enabled, BarberStatusEnum::Disabled, $admin, $reason);
    }

    public function activate(string $barberId, AdminModel $admin, ?string $reason): BarberModel
    {
        return $this->move($barberId, BarberStatusEnum::Disabled, BarberStatusEnum::Enabled, $admin, $reason);
    }

    /**
     * The legacy toggle routes (admin, branch manager) may only switch a barber the review queue already approved:
     * a pending or rejected barber stays where NS-30 put it. Repeating an on or off stays allowed (idempotent).
     */
    public function ensureToggleable(string $barberId): void
    {
        $status = BarberModel::query()->findOrFail($barberId)->status;
        if ($status === BarberStatusEnum::Pending || $status === BarberStatusEnum::Rejected) {
            throw BarberActivationException::notApproved();
        }
    }

    private function move(string $barberId, BarberStatusEnum $from, BarberStatusEnum $to, AdminModel $admin, ?string $reason): BarberModel
    {
        return DB::transaction(function () use ($barberId, $from, $to, $admin, $reason): BarberModel {
            $barber = BarberModel::query()->lockForUpdate()->findOrFail($barberId);
            if ($barber->status !== $from) {
                throw $from === BarberStatusEnum::Enabled ? BarberActivationException::notEnabled() : BarberActivationException::notDisabled();
            }

            // The ActivationLogObserver syncs the barber's status from the log.
            ActivationLogModel::query()->create([
                'activable_id' => $barber->getKey(),
                'activable_type' => ActivableTypeEnum::Barber,
                'status' => $to === BarberStatusEnum::Enabled ? ActivationStatusEnum::Enabled : ActivationStatusEnum::Disabled,
                'reason' => $reason,
                'activated_by_id' => $admin->getKey(),
                'activated_at' => now(),
            ]);

            return $barber->refresh();
        });
    }
}
