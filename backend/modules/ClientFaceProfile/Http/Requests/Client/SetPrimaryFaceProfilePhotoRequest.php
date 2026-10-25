<?php

declare(strict_types=1);

namespace Modules\ClientFaceProfile\Http\Requests\Client;

use Illuminate\Support\Facades\Gate;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\CQRS\Command\SetPrimaryFaceProfilePhotoCommand;
use Modules\ClientFaceProfile\Models\ClientFaceProfileModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SetPrimaryFaceProfilePhotoRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $profile = ClientFaceProfileModel::query()->findOrFail($this->route('photo'));
        $client = $this->user('client');

        return $client instanceof ClientModel
            && Gate::forUser($client)->allows('update', $profile);
    }

    public function rules(): array
    {
        return [];
    }

    public function toCommand(string $profileId): SetPrimaryFaceProfilePhotoCommand
    {
        return new SetPrimaryFaceProfilePhotoCommand(profileId: $profileId);
    }
}
