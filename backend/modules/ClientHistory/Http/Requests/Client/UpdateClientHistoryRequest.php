<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Client;

use Illuminate\Support\Facades\Gate;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\CQRS\Command\UpdateClientHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateClientHistoryRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $history = ClientServiceHistoryModel::query()->findOrFail($this->route('history'));
        $client = $this->user('client');

        return $client instanceof ClientModel
            && Gate::forUser($client)->allows('update', $history);
    }

    public function rules(): array
    {
        return [
            'client_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'client_notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
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
