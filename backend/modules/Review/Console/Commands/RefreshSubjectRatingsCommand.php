<?php

declare(strict_types=1);

namespace Modules\Review\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Review\Services\SubjectRatingRefresher;

#[Signature('reviews:refresh-ratings')]
#[Description('Recompute the stored rating aggregate of every branch and barber')]
final class RefreshSubjectRatingsCommand extends Command
{
    public function handle(SubjectRatingRefresher $refresher): int
    {
        $this->info(trans('review::messages.ratings_refreshed', ['count' => $refresher->refreshAll()], 'en'));

        return self::SUCCESS;
    }
}
