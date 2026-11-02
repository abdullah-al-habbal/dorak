<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Http\Requests\Barber;

use Closure;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Barber\CreateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateAffiliationRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $barber = $this->user('barber');

        return $barber instanceof BarberModel
            && Gate::forUser($barber)->allows('create', [BarberAffiliationModel::class, (string) $this->route('barber')]);
    }

    public function rules(): array
    {
        return [
            'affiliable_id' => ['required', 'string', $this->affiliableExistsRule()],
            'affiliable_type' => ['required', Rule::enum(AffiliableType::class)],
            'commission_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    private function affiliableExistsRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $type = AffiliableType::tryFrom((string) $this->input('affiliable_type'));

            if ($type === null) {
                return;
            }

            $exists = match ($type) {
                AffiliableType::Branch => BranchModel::query()->whereKey($value)->exists(),
                AffiliableType::Brand => BrandModel::query()->whereKey($value)->exists(),
            };

            if (! $exists) {
                $fail(__('barberaffiliation::messages.affiliable_not_found'));
            }
        };
    }

    public function toCommand(string $barber): CreateAffiliationCommand
    {
        return new CreateAffiliationCommand(
            barberId: $barber,
            affiliableId: (string) $this->validated('affiliable_id'),
            affiliableType: AffiliableType::from((string) $this->validated('affiliable_type')),
            commissionPercent: $this->validated('commission_percent') !== null ? (float) $this->validated('commission_percent') : null,
        );
    }
}
