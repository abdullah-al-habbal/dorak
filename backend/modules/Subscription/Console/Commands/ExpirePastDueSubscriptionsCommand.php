<?php

declare(strict_types=1);

namespace Modules\Subscription\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Subscription\Handlers\ExpirePastDueSubscriptionsHandler;

#[Signature('subscriptions:expire-past-due')]
#[Description('Cancel past_due subscriptions whose grace period elapsed and revoke their plan features')]
final class ExpirePastDueSubscriptionsCommand extends Command
{
    public function handle(ExpirePastDueSubscriptionsHandler $handler): int
    {
        $this->info(trans('subscription::messages.grace_expired', ['count' => $handler->handle()], 'en'));

        return self::SUCCESS;
    }
}
