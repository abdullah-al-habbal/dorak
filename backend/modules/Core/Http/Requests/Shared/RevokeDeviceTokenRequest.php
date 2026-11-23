<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Models\DeviceTokenModel;

final class RevokeDeviceTokenRequest extends BaseApiFormRequest
{
    /** An unknown token passes (the revoke is idempotent); a token of another account is forbidden. */
    public function authorize(): bool
    {
        $actor = $this->user();
        $deviceToken = $this->deviceToken();

        return $actor !== null
            && ($deviceToken === null || Gate::forUser($actor)->allows('revoke', $deviceToken));
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
        ];
    }

    public function deviceToken(): ?DeviceTokenModel
    {
        return DeviceTokenModel::query()->where('token', $this->string('token')->toString())->first();
    }
}
