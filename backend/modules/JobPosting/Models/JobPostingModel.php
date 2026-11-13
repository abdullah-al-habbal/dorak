<?php

// modules/JobPosting/Models/JobPostingModel.php
declare(strict_types=1);

namespace Modules\JobPosting\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Branch\Models\BranchModel;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Enums\JobPostingTypeEnum;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['branch_id', 'title', 'description', 'status', 'requirements', 'location', 'employment_type'])]
#[Table('job_postings')]
#[Translatable([
    'title',
    'description',
])]
class JobPostingModel extends Model
{
    use HasFactory;
    use HasTranslations;
    use HasUuids;

    protected function casts(): array
    {
        return [
            'employment_type' => JobPostingTypeEnum::class,
            'status' => JobPostingStatusEnum::class,
            'title' => 'array',
            'description' => 'array',
            'requirements' => 'array',
        ];
    }

    /**
     * Postings the public board may show and accept applications for: open, on a branch whose
     * brand is Active (D11). Pending, Suspended and Rejected brands, and brandless branches, stay hidden.
     *
     * @param  Builder<JobPostingModel>  $query
     * @return Builder<JobPostingModel>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('status', JobPostingStatusEnum::Open)
            ->whereHas('branch', fn (Builder $branch) => $branch->whereHas('brand', fn (Builder $brand) => $brand->active()));
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(BranchModel::class, 'branch_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ApplicationModel::class, 'job_posting_id');
    }
}
