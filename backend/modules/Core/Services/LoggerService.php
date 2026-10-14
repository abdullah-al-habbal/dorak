<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Log;
use Throwable;

final class LoggerService
{
    public function info(string $message, array $context = []): void
    {
        Log::info($message, $this->enrichContext($context));
    }

    public function warning(string $message, array $context = []): void
    {
        Log::warning($message, $this->enrichContext($context));
    }

    public function error(string $message, array $context = []): void
    {
        Log::error($message, $this->enrichContext($context));
    }

    /** @param array<string, mixed> $context */
    public function exception(Throwable $exception, array $context = []): void
    {
        Log::error('Unhandled exception', $this->enrichContext([
            ...$context,
            'exception' => $exception::class,
            'exception_message' => $exception->getMessage(),
            'exception_file' => $exception->getFile(),
            'exception_line' => $exception->getLine(),
        ]));
    }

    private function enrichContext(array $context): array
    {
        $request = request();

        if ($request?->attributes->has('request_uuid')) {
            $context['uuid'] = $request->attributes->get('request_uuid');
        }

        return $context;
    }
}
