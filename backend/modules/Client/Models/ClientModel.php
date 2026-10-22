<?php

// modules/Client/Models/ClientModel.php
declare(strict_types=1);

namespace Modules\Client\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Ban\Models\BanModel;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Database\Factories\ClientFactory;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Core\Enums\Universe;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'email', 'email_verified_at', 'password', 'preferred_universe', 'phone', 'phone_verified_at', 'avatar', 'status'])]
#[Hidden(['password', 'remember_token'])]
#[Table('clients')]
#[Translatable(['name'])]
class ClientModel extends Authenticatable implements FilamentUser
{
    use HasApiTokens;
    use HasFactory;
    use HasTranslations;
    use HasUuids;
    use Notifiable;
    use SoftDeletes;

    protected static function newFactory(): ClientFactory
    {
        return ClientFactory::new();
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'barber' && $this->isBarber();
    }

    public function isBarber(): bool
    {
        return false;
    }

    public function bans(): MorphMany
    {
        return $this->morphMany(BanModel::class, 'bannable');
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccountModel::class, 'client_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(BookingModel::class, 'client_id');
    }

    /**
     * Published reviews in which a branch or barber rated this client: the
     * client's reputation (Task 40). They are shown to staff, never to the
     * client.
     *
     * @return MorphMany<ReviewModel, $this>
     */
    public function receivedReviews(): MorphMany
    {
        return $this->morphMany(ReviewModel::class, 'subject')->where('status', ReviewStatus::Published);
    }

    /**
     * @param  Builder<ClientModel>  $query
     * @return Builder<ClientModel>
     */
    public function scopeWithReputation(Builder $query): Builder
    {
        return $query
            ->withAvg('receivedReviews as reputation_average', 'rating')
            ->withCount('receivedReviews as reputation_count');
    }

    public function isBanned(): bool
    {
        return $this->bans()->active()->exists();
    }

    /** @return list<string> */
    public function accessTokenAbilities(): array
    {
        return $this->getAttribute('status') === ClientStatusEnum::Enabled
            && $this->getAttribute('email_verified_at') !== null
            ? ['client-active']
            : ['email-verification'];
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => ClientStatusEnum::class,
            'preferred_universe' => Universe::class,
            'deleted_at' => 'datetime',
        ];
    }
}
