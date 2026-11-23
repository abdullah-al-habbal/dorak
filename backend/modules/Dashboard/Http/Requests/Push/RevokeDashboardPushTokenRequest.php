<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Push;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Models\DeviceTokenModel;

final class RevokeDashboardPushTokenRequest extends BaseApiFormRequest
{
    /** An unknown token passes (the revoke is idempotent); a token of another account is forbidden. */
    public function authorize(): bool
    {
        $deviceToken = $this->deviceToken();

        return $deviceToken === null || Gate::forUser($this->account())->allows('revoke', $deviceToken);
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
        ];
    }

    public function account(): Model
    {
        $account = $this->attributes->get('dashboard_model');
        abort_unless($account instanceof Model, 401);

        return $account;
    }

    public function deviceToken(): ?DeviceTokenModel
    {
        return DeviceTokenModel::query()->where('token', $this->string('token')->toString())->first();
    }
}
