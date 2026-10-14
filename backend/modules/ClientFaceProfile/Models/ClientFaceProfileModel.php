<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;

/**
 * @property string $id
 * @property string $client_id
 * @property string|null $image_path
 * @property string $image_hash
 * @property bool $is_primary
 * @property FaceAnalysisStatusEnum $analysis_status
 * @property Carbon $uploaded_at
 * @property Carbon $created_at
 */
#[Fillable(['client_id', 'image_path', 'image_hash', 'is_primary', 'analysis_status', 'uploaded_at'])]
#[Table('client_face_profiles')]
class ClientFaceProfileModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'analysis_status' => FaceAnalysisStatusEnum::class,
            'uploaded_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientModel::class, 'client_id');
    }

    public function analysisResults(): HasMany
    {
        return $this->hasMany(ClientFaceAnalysisResultModel::class, 'face_profile_id');
    }
}
