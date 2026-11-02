<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;

#[Fillable(['client_id', 'favorited_id', 'favorited_type'])]
#[Table('client_favorites')]
final class ClientFavoriteModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'favorited_type' => FavoritedTypeEnum::class,
        ];
    }

    public function favorited(): MorphTo
    {
        return $this->morphTo();
    }
}
