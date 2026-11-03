<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Client;

use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\CQRS\Command\AttachHistoryMediaCommand;
use Modules\ClientHistory\Enums\HistoryMediaType;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class AttachHistoryMediaRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $history = ClientServiceHistoryModel::query()->findOrFail($this->route('history'));
        $client = $this->user('client');

        return $client instanceof ClientModel
            && Gate::forUser($client)->allows('view', $history);
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
