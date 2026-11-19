<?php

declare(strict_types=1);

namespace Modules\Core\Exceptions;

use RuntimeException;

/** Production is configured with a delivery driver that sends nothing to users. */
final class UnsafeDeliveryConfigurationException extends RuntimeException {}
