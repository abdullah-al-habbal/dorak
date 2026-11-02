<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\ValuesObjects;

final readonly class ClientPreferenceVectorDataValueObject
{
    private function __construct(
        private array $vector,
        private array $embeddingMetadata,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            vector: (array) ($data['vector'] ?? []),
            embeddingMetadata: (array) ($data['embedding_metadata'] ?? []),
        );
    }

    public function toArray(): array
    {
        return [
            'vector' => $this->vector,
            'embedding_metadata' => $this->embeddingMetadata,
        ];
    }

    public function vector(): array
    {
        return $this->vector;
    }

    public function embeddingMetadata(): array
    {
        return $this->embeddingMetadata;
    }
}
