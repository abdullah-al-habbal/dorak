<?php

declare(strict_types=1);

namespace Modules\Dashboard\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;
use Modules\Dashboard\Services\UnverifiedSignupPurger;

#[Signature(OwnerRegistrationConstants::PURGE_COMMAND)]
#[Description('Remove sign-ups that never confirmed their email within the retention period')]
final class PurgeUnverifiedSignupsCommand extends Command
{
    public function handle(UnverifiedSignupPurger $purger): int
    {
        $this->info(sprintf('Removed %d unverified sign-up(s).', $purger->purge()));

        return self::SUCCESS;
    }
}
