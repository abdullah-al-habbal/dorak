<?php

declare(strict_types=1);

namespace Modules\Payout\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Payout\Handlers\GeneratePayoutsHandler;

/** Semi-automatic settlement: creates drafts only; an admin still approves and pays. */
#[Signature('payouts:generate')]
#[Description('Create draft payouts from unsettled commission entries')]
final class GeneratePayoutsCommand extends Command
{
    public function handle(GeneratePayoutsHandler $handler): int
    {
        $this->info(sprintf('%d draft payout(s) created.', $handler->handle()->count()));

        return self::SUCCESS;
    }
}
