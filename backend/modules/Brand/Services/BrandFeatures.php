<?php

declare(strict_types=1);

namespace Modules\Brand\Services;

use Laravel\Pennant\Feature;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Exceptions\FeatureNotEnabledException;
use Modules\Brand\Features\JobBoardFeature;
use Modules\Brand\Features\MultiBranchFeature;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;

/**
 * Brand premium flags (Task 50), stored per brand with Pennant and read at
 * action time (I5). Freelance barbers have no brand and are never evaluated
 * (I4).
 *
 * Downgrade (I3/EC-6): with `multi_branch` off, a brand keeps every branch;
 * all stay visible and bookable, but only its original (oldest) branch may be
 * reconfigured — the others are read-only until the flag is on again.
 */
final class BrandFeatures
{
    public const string MULTI_BRANCH = 'multi_branch';

    public const string JOB_BOARD = 'job_board';

    /** @var array<string, class-string> */
    private const array FEATURES = [
        self::MULTI_BRANCH => MultiBranchFeature::class,
        self::JOB_BOARD => JobBoardFeature::class,
    ];

    public function enabled(BrandModel $brand, string $feature): bool
    {
        return Feature::for($brand)->active(self::FEATURES[$feature]);
    }

    /** @return array{multi_branch: bool, job_board: bool} */
    public function all(BrandModel $brand): array
    {
        return [
            self::MULTI_BRANCH => $this->enabled($brand, self::MULTI_BRANCH),
            self::JOB_BOARD => $this->enabled($brand, self::JOB_BOARD),
        ];
    }

    /** @param array<string, bool> $flags */
    public function set(BrandModel $brand, array $flags): void
    {
        foreach ($flags as $feature => $on) {
            $class = self::FEATURES[$feature] ?? null;
            if ($class === null) {
                continue;
            }
            $on ? Feature::for($brand)->activate($class) : Feature::for($brand)->deactivate($class);
        }
    }

    /** A3: the brand already has a branch and may not add another. */
    public function ensureCanAddBranch(mixed $brandId): void
    {
        $brand = BrandModel::query()->find($brandId);
        if ($brand === null || ! $brand->branches()->exists()) {
            return;
        }

        if (! $this->enabled($brand, self::MULTI_BRANCH)) {
            throw new FeatureNotEnabledException(self::MULTI_BRANCH);
        }
    }

    /** G1: job postings for this branch need the brand's job board. */
    public function ensureJobBoard(mixed $branchId): void
    {
        $brand = BranchModel::query()->find($branchId)?->brand;
        if ($brand instanceof BrandModel && ! $this->enabled($brand, self::JOB_BOARD)) {
            throw new FeatureNotEnabledException(self::JOB_BOARD);
        }
    }

    /** EC-6 for writes addressed by chair (stylist assignment). */
    public function ensureChairBranchManageable(mixed $chairId): void
    {
        if ($chairId === null) {
            return;
        }

        $this->ensureBranchManageable(ChairModel::query()->whereKey($chairId)->value('branch_id'));
    }

    /** EC-6: a non-original branch of a downgraded brand is read-only. */
    public function ensureBranchManageable(mixed $branchId): void
    {
        $branch = BranchModel::query()->find($branchId);
        $brand = $branch?->brand;
        if (! $branch instanceof BranchModel || ! $brand instanceof BrandModel || $this->enabled($brand, self::MULTI_BRANCH)) {
            return;
        }

        $originalId = $brand->branches()->orderBy('created_at')->orderBy('id')->value('id');
        if ((string) $originalId !== (string) $branch->getKey()) {
            throw new FeatureNotEnabledException(self::MULTI_BRANCH);
        }
    }
}
