<?php

declare(strict_types=1);

namespace Modules\Payout\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Payout\CQRS\Command\TransitionPayoutCommand;
use Modules\Payout\Enums\PayoutStatus;
use Modules\Payout\Models\PayoutModel;

final class TransitionPayoutHandler
{
    /** Returns null when the state machine forbids the move. */
    public function handle(PayoutModel $payout, TransitionPayoutCommand $command): ?PayoutModel
    {
        if (! $payout->status->canTransitionTo($command->next)) {
            return null;
        }

        return DB::transaction(function () use ($payout, $command): PayoutModel {
            $payout->update([
                'status' => $command->next,
                'reference' => $command->reference ?? $payout->reference,
                'notes' => $command->notes ?? $payout->notes,
                ...match ($command->next) {
                    PayoutStatus::Approved => ['approved_by_id' => $command->adminId, 'approved_at' => now()],
                    PayoutStatus::Paid => ['paid_at' => now()],
                    default => [],
                },
            ]);

            if ($command->next === PayoutStatus::Canceled) {
                CommissionEntryModel::query()->where('payout_id', $payout->getKey())->update(['payout_id' => null]);
            }

            return $payout->load(['brand', 'currency']);
        });
    }
}
