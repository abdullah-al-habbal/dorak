<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\CQRS\Command;

use Modules\ClientInteraction\Enums\FavoritedTypeEnum;

final readonly class AddFavoriteCommand
{
    public function __construct(
        public string $clientId,
        public string $favoritedId,
        public FavoritedTypeEnum $favoritedType,
    ) {}
}
