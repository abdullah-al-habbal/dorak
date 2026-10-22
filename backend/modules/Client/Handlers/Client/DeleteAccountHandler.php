<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\DeleteAccountCommand;
use Modules\Client\Models\ClientModel;
use Modules\Client\Services\ClientAccountDeletion;
use Modules\Client\ValuesObjects\DeleteAccountResult;

final class DeleteAccountHandler
{
    public function __construct(
        private readonly ClientAccountDeletion $deletion,
    ) {}

    public function handle(DeleteAccountCommand $command): DeleteAccountResult
    {
        $client = ClientModel::findOrFail($command->clientId);

        if (! Hash::check($command->password, $client->password)) {
            return DeleteAccountResult::invalidCredentials();
        }

        $deleted = $this->deletion->delete($client);

        if (! $deleted) {
            return DeleteAccountResult::activeBookings();
        }

        return DeleteAccountResult::success();
    }
}
