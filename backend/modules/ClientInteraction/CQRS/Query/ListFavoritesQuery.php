<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\CQRS\Query;

use Modules\ClientInteraction\Enums\FavoritedTypeEnum;

final readonly class ListFavoritesQuery
{
    public function __construct(
        public string $clientId,
        public ?FavoritedTypeEnum $favoritedType,
        public int $perPage,
    ) {}
}
