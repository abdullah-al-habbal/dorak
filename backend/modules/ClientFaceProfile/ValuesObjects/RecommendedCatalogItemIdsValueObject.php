<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\ValuesObjects;

final readonly class RecommendedCatalogItemIdsValueObject
{
    /** @param list<string> $ids */
    private function __construct(
        private array $ids,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            ids: isset($data['ids']) ? array_values(array_map(strval(...), array_filter((array) $data['ids'], is_scalar(...)))) : [],
        );
    }

    public function toArray(): array
    {
        return [
            'ids' => $this->ids,
        ];
    }

    public function ids(): array
    {
        return $this->ids;
    }
}
