<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Client;

use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\CQRS\Command\RebookFromHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RebookFromHistoryRequest extends BaseApiFormRequest
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
            'time_slot' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after:now'],
        ];
    }

    public function toCommand(string $historyId): RebookFromHistoryCommand
    {
        return new RebookFromHistoryCommand(
            historyId: $historyId,
            clientId: (string) $this->user()->id,
            timeSlot: (new Carbon((string) $this->validated('time_slot')))->utc(),
        );
    }
}
