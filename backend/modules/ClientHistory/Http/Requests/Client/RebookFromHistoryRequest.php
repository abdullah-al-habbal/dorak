<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Client;

use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Validator;
use Modules\Branch\Services\BranchTimeZones;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\CQRS\Command\RebookFromHistoryCommand;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/**
 * The time is either `starts_at`, a UTC instant, or `starts_at_local`, a time on the clock of the visit's
 * branch: a client can't convert a future branch time itself without a time zone database (BG-55).
 */
final class RebookFromHistoryRequest extends BaseApiFormRequest
{
    private const string LOCAL_FORMAT = 'Y-m-d\TH:i';

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
            'starts_at' => ['required_without:starts_at_local', 'prohibits:starts_at_local', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after:now'],
            'starts_at_local' => ['sometimes', 'date_format:'.self::LOCAL_FORMAT],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (! $this->filled('starts_at_local') || $validator->errors()->has('starts_at_local')) {
                return;
            }
            if ($this->localStart((string) $this->route('history'))->isPast()) {
                $validator->errors()->add('starts_at_local', __('validation.after', ['attribute' => __('validation.attributes.starts_at_local'), 'date' => 'now']));
            }
        });
    }

    public function toCommand(string $historyId): RebookFromHistoryCommand
    {
        return new RebookFromHistoryCommand(
            historyId: $historyId,
            clientId: (string) $this->user()->id,
            startsAt: $this->filled('starts_at_local')
                ? $this->localStart($historyId)
                : (new Carbon((string) $this->validated('starts_at')))->utc(),
        );
    }

    private function localStart(string $historyId): Carbon
    {
        $branchId = ClientServiceHistoryModel::query()->whereKey($historyId)->value('branch_id');
        $zone = app(BranchTimeZones::class)->for(is_string($branchId) ? $branchId : null);

        return Carbon::createFromFormat('!'.self::LOCAL_FORMAT, $this->string('starts_at_local')->toString(), $zone)->utc();
    }
}
