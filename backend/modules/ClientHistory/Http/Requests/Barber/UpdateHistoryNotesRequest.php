<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Barber;

use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\ClientHistory\CQRS\Command\UpdateClientHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateHistoryNotesRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $history = ClientServiceHistoryModel::query()->findOrFail($this->route('history'));
        $barber = $this->user('barber');

        return $barber instanceof BarberModel
            && Gate::forUser($barber)->allows('updateBarberNotes', $history);
    }

    public function rules(): array
    {
        return [
            'barber_notes' => ['required', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function toCommand(string $historyId): UpdateClientHistoryCommand
    {
        return new UpdateClientHistoryCommand(
            historyId: $historyId,
            attributes: $this->validated(),
        );
    }
}
