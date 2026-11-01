<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Brand\CQRS\Command\Client\UpdateBrandCommand;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateBrandRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $brandId = $this->route('brand');
        $actor = $this->attributes->get('dashboard_actor');
        // Dashboard calls are scoped by the actor (admin: any brand; owner: owned brands).
        if ($actor instanceof DashboardActor) {
            return $actor->canManageBrand($brandId);
        }

        $brand = BrandModel::findOrFail($brandId);

        return $brand->owner_id === $this->user()->getAuthIdentifier();
    }

    public function rules(): array
    {
        return [
            'name.en' => ['sometimes', 'string', 'max:255'],
            'name.ar' => ['sometimes', 'string', 'max:255'],
            'base_currency_code' => ['sometimes', 'string', 'exists:currencies,code'],
            'logo' => ['nullable', 'url', 'max:2048'],
            'description.en' => ['nullable', 'string', 'max:5000'],
            'description.ar' => ['nullable', 'string', 'max:5000'],
            'universe' => ['sometimes', Rule::enum(VenueUniverse::class)],
        ];
    }

    public function toCommand(string $brandId): UpdateBrandCommand
    {
        $data = $this->validated();

        return new UpdateBrandCommand(
            brandId: $brandId,
            nameEn: $data['name']['en'] ?? null,
            nameAr: $data['name']['ar'] ?? null,
            ownerId: null,
            baseCurrencyCode: $data['base_currency_code'] ?? null,
            logo: $data['logo'] ?? null,
            descriptionEn: $data['description']['en'] ?? null,
            descriptionAr: $data['description']['ar'] ?? null,
            universe: isset($data['universe']) ? VenueUniverse::from((string) $data['universe']) : null,
        );
    }
}
