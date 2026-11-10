<?php

// modules/Admin/Models/AdminModel.php
declare(strict_types=1);

namespace Modules\Admin\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
#[Table('admins')]
#[Translatable(['name'])]
class AdminModel extends Authenticatable implements FilamentUser
{
    use HasApiTokens;
    use HasFactory;
    use HasTranslations;
    use HasUuids;
    use Notifiable;

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin' && $this->isActive();
    }

    /** NS-04: a deactivated admin can no longer sign in and every token they hold stops working. */
    public function isActive(): bool
    {
        return $this->getAttribute('deactivated_at') === null;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
