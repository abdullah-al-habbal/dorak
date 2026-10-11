<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Requests\Barber;

use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Barber\AcceptAffiliationCommand;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class AcceptAffiliationRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $barber = $this->user('barber');
        $affiliation = BarberAffiliationModel::query()->find($this->route('affiliation'));

        return $barber instanceof BarberModel
            && $affiliation instanceof BarberAffiliationModel
            && Gate::forUser($barber)->allows('accept', $affiliation);
    }

    public function rules(): array
    {
        return [];
    }

    public function toCommand(string $affiliationId): AcceptAffiliationCommand
    {
        return new AcceptAffiliationCommand(
            affiliationId: $affiliationId,
        );
    }
}
