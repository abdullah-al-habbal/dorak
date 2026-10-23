<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Branch\Resources\JobPostingResource\Pages;

use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Modules\Brand\Exceptions\FeatureNotEnabledException;
use Modules\Brand\Services\BrandFeatures;
use Modules\JobPosting\Filament\Panels\Branch\Resources\JobPostingResource\JobPostingResource;

class CreateJobPostingPage extends CreateRecord
{
    protected static string $resource = JobPostingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['branch_id'] = filament()->auth()->id();

        return $data;
    }

    /** Premium brand flags apply in the panels too (Task 50). */
    protected function handleRecordCreation(array $data): Model
    {
        try {
            app(BrandFeatures::class)->ensureJobBoard($data['branch_id'] ?? null);
        } catch (FeatureNotEnabledException $exception) {
            Notification::make()->danger()->title($exception->getMessage())->send();

            $this->halt();
        }

        return parent::handleRecordCreation($data);
    }
}
