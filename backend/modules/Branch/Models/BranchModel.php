<?php

declare(strict_types=1);

namespace Modules\Branch\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\Review\Models\ReviewModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'email', 'password', 'brand_id', 'latitude', 'longitude', 'status', 'floor_plan_preset', 'floor_plan_zones', 'floor_plan_canvas', 'floor_plan_decorations', 'universe', 'description', 'address', 'tags'])]
#[Hidden(['password', 'remember_token'])]
#[Table('branches')]
#[Translatable(['name', 'description', 'address'])]
class BranchModel extends Authenticatable implements FilamentUser
{
    use HasApiTokens;
    use HasFactory;
    use HasTranslations;
    use HasUuids;
    use Notifiable;

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'branch';
    }

    public function activationLogs(): MorphMany
    {
        return $this->morphMany(ActivationLogModel::class, 'activable');
    }

    /** @return MorphMany<BanModel, $this> */
    public function bans(): MorphMany
    {
        return $this->morphMany(BanModel::class, 'bannable');
    }

    /**
     * @param  Builder<BranchModel>  $query
     * @return Builder<BranchModel>
     */
    public function scopeDiscoverable(Builder $query): Builder
    {
        return $query->where('status', BranchStatusEnum::Enabled->value)
            ->whereHas('brand', fn ($brand) => $brand->active())
            ->whereDoesntHave('bans', fn ($bans) => $bans
                ->where('banned_at', '<=', now())
                ->where(fn ($activeBans) => $activeBans
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now())
                ));
    }

    /** @return HasMany<BranchOpeningHourModel, $this> */
    public function openingHours(): HasMany
    {
        return $this->hasMany(BranchOpeningHourModel::class, 'branch_id')->orderBy('day_of_week');
    }

    /** @return HasMany<BranchHoursOverrideModel, $this> */
    public function hoursOverrides(): HasMany
    {
        return $this->hasMany(BranchHoursOverrideModel::class, 'branch_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(BrandModel::class, 'brand_id');
    }

    /** @return HasMany<ChairModel, $this> */
    public function chairs(): HasMany
    {
        return $this->hasMany(ChairModel::class, 'branch_id');
    }

    public function barbers(): HasManyThrough
    {
        return $this->hasManyThrough(BarberModel::class, ChairModel::class, 'branch_id', 'id', 'id', 'barber_id');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(ReviewModel::class, 'subject');
    }

    /** Enabled, and its brand (if any) has been approved by a platform admin (G2). */
    public function isOperational(): bool
    {
        if ($this->getAttribute('status') !== BranchStatusEnum::Enabled) {
            return false;
        }

        $brand = $this->brand;

        return $brand === null || $brand->isActive();
    }

    /** @return Attribute<bool, never> */
    protected function isEnabled(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->status === BranchStatusEnum::Enabled,
        );
    }

    /**
     * A branch created without a universe inherits its brand's (Task 44), on
     * every creation path (dashboard, Filament, brand onboarding).
     */
    protected static function booted(): void
    {
        static::creating(function (BranchModel $branch): void {
            if ($branch->getAttribute('universe') !== null) {
                return;
            }

            $brandUniverse = BrandModel::query()->whereKey($branch->getAttribute('brand_id'))->value('universe');
            $branch->setAttribute('universe', $brandUniverse instanceof VenueUniverse
                ? $brandUniverse
                : (VenueUniverse::tryFrom((string) $brandUniverse) ?? VenueUniverse::Unisex));
        });

        /**
         * EC-20: a deleted branch's job postings outlive it (branch_id is
         * nullable/nullOnDelete, not cascading), so open postings are closed
         * first — applications are never deleted alongside the branch.
         */
        static::deleting(function (BranchModel $branch): void {
            JobPostingModel::where('branch_id', $branch->id)
                ->where('status', JobPostingStatusEnum::Open)
                ->update(['status' => JobPostingStatusEnum::Closed]);
        });
    }

    protected function casts(): array
    {
        return [
            'status' => BranchStatusEnum::class,
            'universe' => VenueUniverse::class,
            'tags' => 'json:unicode',
            'floor_plan_preset' => FloorPlanPreset::class,
            'floor_plan_zones' => 'array',
            'floor_plan_canvas' => 'array',
            'floor_plan_decorations' => 'array',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }
}
