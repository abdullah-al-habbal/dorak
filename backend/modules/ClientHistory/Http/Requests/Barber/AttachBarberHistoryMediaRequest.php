<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Barber;

use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Modules\Barber\Models\BarberModel;
use Modules\ClientHistory\CQRS\Command\AttachHistoryMediaCommand;
use Modules\ClientHistory\Enums\HistoryMediaType;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class AttachBarberHistoryMediaRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $history = ClientServiceHistoryModel::query()->findOrFail($this->route('history'));
        $barber = $this->user('barber');

        return $barber instanceof BarberModel
            && Gate::forUser($barber)->allows('attachMedia', $history);
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'],
            'photo_type' => ['required', Rule::enum(HistoryMediaType::class)],
        ];
    }

    public function toCommand(string $historyId, string $photoPath): AttachHistoryMediaCommand
    {
        return new AttachHistoryMediaCommand(
            historyId: $historyId,
            photoPath: $photoPath,
            photoType: HistoryMediaType::from($this->validated('photo_type')),
        );
    }
}
