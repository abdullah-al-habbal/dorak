<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Brand\CQRS\Command\Client\CreateBrandCommand;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateBrandRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'base_currency_code' => ['required', 'string', 'exists:currencies,code'],
            'logo' => ['nullable', 'url', 'max:2048'],
            'description.en' => ['nullable', 'string', 'max:5000'],
            'description.ar' => ['nullable', 'string', 'max:5000'],
            'universe' => ['sometimes', Rule::enum(VenueUniverse::class)],
            'first_branch' => ['sometimes', 'array'],
            'first_branch.name.en' => ['sometimes', 'string', 'max:120'],
            'first_branch.name.ar' => ['sometimes', 'string', 'max:120'],
            'first_branch.latitude' => ['nullable', 'required_with:first_branch.longitude', 'numeric', 'between:-90,90'],
            'first_branch.longitude' => ['nullable', 'required_with:first_branch.latitude', 'numeric', 'between:-180,180'],
            'first_branch.email' => ['nullable', 'email', 'max:255', Rule::unique('branches', 'email')],
            'first_branch.password' => ['nullable', 'required_with:first_branch.email', 'string', 'min:12', 'max:255'],
        ];
    }

    /** @param string|null $ownerId defaults to the authenticated client */
    public function toCommand(?string $ownerId = null): CreateBrandCommand
    {
        return new CreateBrandCommand(
            ownerId: $ownerId ?? (string) $this->user()->getAuthIdentifier(),
            nameEn: $this->validated('name.en'),
            nameAr: $this->validated('name.ar'),
            baseCurrencyCode: $this->validated('base_currency_code'),
            logo: $this->validated('logo'),
            descriptionEn: $this->validated('description.en'),
            descriptionAr: $this->validated('description.ar'),
            universe: VenueUniverse::tryFrom((string) $this->validated('universe', '')) ?? VenueUniverse::Unisex,
            firstBranchNameEn: $this->validated('first_branch.name.en'),
            firstBranchNameAr: $this->validated('first_branch.name.ar'),
            firstBranchLatitude: $this->validated('first_branch.latitude') === null ? null : (float) $this->validated('first_branch.latitude'),
            firstBranchLongitude: $this->validated('first_branch.longitude') === null ? null : (float) $this->validated('first_branch.longitude'),
            firstBranchEmail: $this->validated('first_branch.email'),
            firstBranchPassword: $this->validated('first_branch.password'),
        );
    }
}
