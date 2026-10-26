<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Requests\Barber;

use Illuminate\Support\Facades\Gate;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Shared\TerminateAffiliationCommand;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class TerminateAffiliationRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $barber = $this->user('barber');
        $affiliation = BarberAffiliationModel::query()->find($this->route('affiliation'));

        return $barber instanceof BarberModel
            && $affiliation instanceof BarberAffiliationModel
            && Gate::forUser($barber)->allows('terminate', $affiliation);
    }

    public function rules(): array
    {
        return [];
    }

    public function toCommand(string $affiliationId): TerminateAffiliationCommand
    {
        /** @var BarberModel $barber */
        $barber = $this->user('barber');

        return new TerminateAffiliationCommand(
            affiliationId: $affiliationId,
            actorType: StatusChangeActorTypeEnum::Barber->value,
            actorId: (string) $barber->id,
        );
    }
}
