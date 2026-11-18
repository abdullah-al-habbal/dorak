<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Constants\BarberAccountDeletionConstants;
use Modules\Barber\Enums\BarberAccountDeletionOutcome;
use Modules\Barber\Handlers\Barber\DeleteAccountHandler;
use Modules\Barber\Http\Requests\Barber\DeleteAccountRequest;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;

/** `DELETE barber/account`: the barber confirms with their password; personal data is removed, the row is kept. */
final class DeleteAccountAction extends BaseApiAction
{
    public function __construct(
        private readonly DeleteAccountHandler $handler,
    ) {}

    public function __invoke(DeleteAccountRequest $request): JsonResponse
    {
        $barber = $request->user('barber');
        abort_unless($barber instanceof BarberModel, 401);

        return match ($this->handler->handle($barber, (string) $request->validated('password'))) {
            BarberAccountDeletionOutcome::Deleted => $this->noContent(),
            BarberAccountDeletionOutcome::InvalidPassword => $this->unauthorized(message: $this->trans('core::messages.invalid_credentials')),
            BarberAccountDeletionOutcome::ActiveBookings => $this->error(
                code: BarberAccountDeletionConstants::BARBER_ACCOUNT_DELETION_ACTIVE_BOOKINGS_CODE,
                message: $this->trans('core::messages.active_bookings_block_deletion'),
                status: 409,
            ),
            BarberAccountDeletionOutcome::ActiveAffiliation => $this->error(
                code: BarberAccountDeletionConstants::BARBER_ACCOUNT_DELETION_ACTIVE_AFFILIATION_CODE,
                message: $this->trans('barber::messages.active_affiliation_block_deletion'),
                status: 409,
            ),
        };
    }
}
