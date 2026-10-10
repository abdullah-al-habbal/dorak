<?php

declare(strict_types=1);

namespace Modules\Booking\Http\Requests\Barber;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CancelBarberBookingRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['cancellation_reason' => ['required', 'string', 'max:500']];
    }
}
