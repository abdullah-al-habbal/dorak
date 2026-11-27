<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Modules\Branch\Constants\BranchTimeZoneConstants;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchTimeZoneModel;

/**
 * The one place that knows a branch's time zone. Instants are stored and sent in
 * UTC; a branch's hours and dates are read in this zone. Bound per request, so a
 * list of bookings reads each branch's zone once.
 */
final class BranchTimeZones
{
    /** @var array<string, string> */
    private array $zones = [];

    public function for(?string $branchId): string
    {
        if ($branchId === null) {
            return BranchTimeZoneConstants::BRANCH_DEFAULT_TIME_ZONE;
        }

        return $this->zones[$branchId] ??= (string) (BranchTimeZoneModel::query()
            ->where('branch_id', $branchId)
            ->value('time_zone') ?? BranchTimeZoneConstants::BRANCH_DEFAULT_TIME_ZONE);
    }

    /** For a model: uses an eager-loaded `timeZoneSetting`, so a list of branches adds one query, not one each. */
    public function forBranch(BranchModel $branch): string
    {
        if ($branch->relationLoaded('timeZoneSetting')) {
            $setting = $branch->getRelation('timeZoneSetting');

            return $this->zones[(string) $branch->getKey()] = $setting instanceof BranchTimeZoneModel
                ? (string) $setting->getAttribute('time_zone')
                : BranchTimeZoneConstants::BRANCH_DEFAULT_TIME_ZONE;
        }

        return $this->for((string) $branch->getKey());
    }

    public function set(string $branchId, string $zone): void
    {
        BranchTimeZoneModel::query()->updateOrCreate(['branch_id' => $branchId], ['time_zone' => $zone]);
        $this->zones[$branchId] = $zone;
    }

    /** The same instant on the branch's clock. */
    public function local(?string $branchId, CarbonInterface $instant): Carbon
    {
        return Carbon::instance($instant)->setTimezone($this->for($branchId));
    }

    /** Today's calendar date at the branch, `Y-m-d`. */
    public function today(?string $branchId): string
    {
        return $this->local($branchId, Carbon::now())->toDateString();
    }

    /** Minutes the branch's clock is ahead of UTC at that instant, for clients that have no zone database. */
    public function offsetMinutes(?string $branchId, CarbonInterface $instant): int
    {
        return intdiv(CarbonImmutable::instance($instant)->setTimezone($this->for($branchId))->getOffset(), 60);
    }
}
