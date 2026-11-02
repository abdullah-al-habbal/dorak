<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Modules\ClientRecommendation\Eloquent\Casts\EmbeddingCast;

#[Fillable(['entity_type', 'entity_id', 'embedding', 'embedding_metadata', 'computed_at'])]
#[Table('entity_embeddings')]
final class EntityEmbeddingModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'embedding' => EmbeddingCast::class,
            'embedding_metadata' => 'array',
            'computed_at' => 'datetime',
        ];
    }
}
