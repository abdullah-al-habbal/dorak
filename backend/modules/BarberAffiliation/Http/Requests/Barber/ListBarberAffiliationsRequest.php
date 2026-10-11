<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Requests\Barber;

use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListBarberAffiliationsRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $barber = $this->user('barber');

        return $barber instanceof BarberModel
            && Gate::forUser($barber)->allows('view', [BarberAffiliationModel::class, (string) $this->route('barber')]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }
}
