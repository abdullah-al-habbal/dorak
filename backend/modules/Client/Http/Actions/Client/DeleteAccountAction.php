<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Constants\ClientAccountDeletionConstants;
use Modules\Client\Handlers\Client\DeleteAccountHandler;
use Modules\Client\Http\Requests\Client\DeleteAccountRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class DeleteAccountAction extends BaseApiAction
{
    public function __construct(
        private readonly DeleteAccountHandler $handler,
    ) {}

    public function __invoke(DeleteAccountRequest $request): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand());

        if ($result->isInvalidCredentials()) {
            return $this->unauthorized(
                message: $this->trans('core::messages.invalid_credentials'),
            );
        }

        if ($result->hasActiveBookings()) {
            return $this->error(
                code: ClientAccountDeletionConstants::CLIENT_ACCOUNT_DELETION_ACTIVE_BOOKINGS_CODE,
                message: $this->trans('core::messages.active_bookings_block_deletion'),
                status: 409,
            );
        }

        return $this->noContent();
    }
}
