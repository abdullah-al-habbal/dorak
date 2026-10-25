<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Branch\Resources\OfferedServiceResource\Pages;

use Filament\Resources\Pages\CreateRecord;
use Modules\OfferedService\Filament\Panels\Branch\Resources\OfferedServiceResource\OfferedServiceResource;

class CreateOfferedServicePage extends CreateRecord
{
    protected static string $resource = OfferedServiceResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $branch = filament()->auth()->user();
        $data['serviceable_id'] = $branch?->getAttribute('brand_id');
        $data['serviceable_type'] = 'brand';

        return $data;
    }
}
