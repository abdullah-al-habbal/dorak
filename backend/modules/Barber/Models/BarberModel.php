<?php

declare(strict_types=1);

namespace Modules\Barber\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Ban\Models\BanModel;
use Modules\Barber\Database\Factories\BarberFactory;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\Review\Models\ReviewModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'bio', 'email', 'phone', 'password', 'has_login', 'status', 'is_freelancer', 'client_id', 'latitude', 'longitude', 'travel_radius_km', 'is_workstation_online', 'managed_by_branch_id', 'universe', 'rejection_reason', 'reviewed_at', 'submission_count'])]
#[Hidden(['password', 'remember_token'])]
#[Table('barbers')]
#[Translatable(['name', 'bio'])]
class BarberModel extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasTranslations;
    use HasUuids;
    use Notifiable;

    protected static function newFactory(): BarberFactory
    {
        return BarberFactory::new();
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

    public function isBanned(): bool
    {
        return $this->bans()
            ->where('banned_at', '<=', now())
            ->where(fn (Builder $query): Builder => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>', now())
            )
            ->exists();
    }

    /**
     * @param  Builder<BarberModel>  $query
     * @return Builder<BarberModel>
     */
    public function scopeDiscoverable(Builder $query): Builder
    {
        return $query->where('status', BarberStatusEnum::Enabled->value)
            ->whereDoesntHave('bans', fn ($bans) => $bans
                ->where('banned_at', '<=', now())
                ->where(fn ($activeBans) => $activeBans
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now())
                ));
    }

    /** @return MorphMany<OfferedServiceModel, $this> */
    public function services(): MorphMany
    {
        return $this->morphMany(OfferedServiceModel::class, 'serviceable');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(ReviewModel::class, 'subject');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(BookingModel::class, 'barber_id');
    }

    /** @return HasMany<ChairModel, $this> */
    public function chairs(): HasMany
    {
        return $this->hasMany(ChairModel::class, 'barber_id');
    }

    /** @return HasMany<BarberPortfolioPhotoModel, $this> */
    public function portfolioPhotos(): HasMany
    {
        return $this->hasMany(BarberPortfolioPhotoModel::class, 'barber_id');
    }

    /** @return Attribute<bool, never> */
    protected function isEnabled(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->status === BarberStatusEnum::Enabled,
        );
    }

    protected function casts(): array
    {
        return [
            'status' => BarberStatusEnum::class,
            'universe' => VenueUniverse::class,
            'email_verified_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'submission_count' => 'integer',
            'password' => 'hashed',
            'has_login' => 'boolean',
            'is_freelancer' => 'boolean',
            'travel_radius_km' => 'decimal:2',
            'is_workstation_online' => 'boolean',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }
}
