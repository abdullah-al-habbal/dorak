<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use RuntimeException;

final class BookingCancellationTooLateException extends RuntimeException {}
