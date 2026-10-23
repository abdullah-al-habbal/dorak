<?php

declare(strict_types=1);

namespace Modules\Branch\Filament\Panels\Admin\Resources\BranchResource\Pages;

use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Modules\Branch\Filament\Panels\Admin\Resources\BranchResource\BranchResource;
use Modules\Brand\Exceptions\FeatureNotEnabledException;
use Modules\Brand\Services\BrandFeatures;

class CreateBranchPage extends CreateRecord
{
    protected static string $resource = BranchResource::class;

    /** Premium brand flags apply in the panels too (Task 50). */
    protected function handleRecordCreation(array $data): Model
    {
        try {
            app(BrandFeatures::class)->ensureCanAddBranch($data['brand_id'] ?? null);
        } catch (FeatureNotEnabledException $exception) {
            Notification::make()->danger()->title($exception->getMessage())->send();

            $this->halt();
        }

        return parent::handleRecordCreation($data);
    }
}
