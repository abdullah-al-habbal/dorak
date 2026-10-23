<?php

declare(strict_types=1);

namespace Modules\Brand\Filament\Panels\Admin\Resources\BrandResource\Pages;

use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Brand\Filament\Panels\Admin\Resources\BrandResource\BrandResource;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\FirstBranchProvisioner;

class CreateBrandPage extends CreateRecord
{
    protected static string $resource = BrandResource::class;

    /** A1 (Task 49): an admin-created brand gets its first branch in the same transaction. */
    protected function handleRecordCreation(array $data): Model
    {
        return DB::transaction(function () use ($data): Model {
            $brand = parent::handleRecordCreation($data);
            if ($brand instanceof BrandModel) {
                app(FirstBranchProvisioner::class)->provision($brand);
            }

            return $brand;
        });
    }
}
