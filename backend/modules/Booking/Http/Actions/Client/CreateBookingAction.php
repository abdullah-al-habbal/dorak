<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use InvalidArgumentException;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\Eloquent\Resolvers\Shared\ActiveBookingBanException;
use Modules\Booking\Eloquent\Resolvers\Shared\AtHomeBookingRuleException;
use Modules\Booking\Eloquent\Resolvers\Shared\BarberNotAffiliatedException;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingOutsideScheduleException;
use Modules\Booking\Eloquent\Resolvers\Shared\ChairNotAvailableException;
use Modules\Booking\Eloquent\Resolvers\Shared\DoubleBookingException;
use Modules\Booking\Eloquent\Resolvers\Shared\IdempotencyKeyReusedException;
use Modules\Booking\Eloquent\Resolvers\Shared\InvalidBookingServicesException;
use Modules\Booking\Eloquent\Resolvers\Shared\NonDiscoverableBookingEntityException;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Handlers\Client\CreateBookingHandler;
use Modules\Booking\Http\Requests\Client\CreateBookingRequest;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class CreateBookingAction extends BaseApiAction
{
    public function __construct(
        private readonly CreateBookingHandler $handler,
    ) {}

    public function __invoke(CreateBookingRequest $request): JsonResponse
    {
        try {
            $result = $this->handler->handle($request->toCommand());
            if (! $result->replayed) {
                event(new BookingCreatedEvent(
                    $this->eventIdentifier($result->booking->getKey()),
                    $this->eventIdentifier($result->booking->branch_id),
                    $this->eventIdentifier($result->booking->client_id),
                ));
            }

            $response = $this->created(
                data: new BookingResource($result->booking),
                message: __('booking::messages.booking_created'),
            );

            return $result->replayed
                ? $response->header(BookingConstants::BOOKING_IDEMPOTENCY_REPLAYED_HEADER, 'true')
                : $response;
        } catch (ChairNotAvailableException) {
            return $this->error(
                message: __('booking::messages.chair_not_available'),
                status: 409,
            );
        } catch (DoubleBookingException) {
            return $this->error(
                message: __('booking::messages.double_booking'),
                status: 409,
            );
        } catch (IdempotencyKeyReusedException $exception) {
            return $this->error(code: 'idempotency_key_reused', message: $exception->getMessage(), status: 422);
        } catch (InvalidBookingServicesException $exception) {
            return $this->error(
                message: $exception->getMessage(),
                status: 422,
            );
        } catch (BarberNotAffiliatedException $exception) {
            return $this->error(code: 'barber_not_affiliated', message: $exception->getMessage(), status: 422);
        } catch (AtHomeBookingRuleException $exception) {
            return $this->error(code: $exception->errorCode, message: $exception->getMessage(), status: 422);
        } catch (ActiveBookingBanException) {
            return $this->error(code: 'ACCOUNT_BANNED', message: __('ban::ui.account_banned'), status: 403);
        } catch (NonDiscoverableBookingEntityException) {
            return $this->error(code: 'ENTITY_NOT_DISCOVERABLE', message: __('booking::messages.entity_not_discoverable'), status: 422);
        } catch (BookingOutsideScheduleException) {
            return $this->error('booking_outside_schedule', __('booking::messages.time_outside_schedule'), 422);
        }
    }

    private function eventIdentifier(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (! is_scalar($value)) {
            throw new InvalidArgumentException('Booking broadcast identifiers must be scalar.');
        }

        return (string) $value;
    }
}
