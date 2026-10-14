<?php

declare(strict_types=1);

namespace Modules\Core\Logging;

use Illuminate\Log\Logger;
use Monolog\LogRecord;

final class StructuredLoggingTap
{
    public function __invoke(Logger $logger): void
    {
        $logger->pushProcessor(function (LogRecord $record): LogRecord {
            $frame = collect(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 30))->first(fn (array $item): bool => isset($item['file'])
                && str_contains($item['file'], DIRECTORY_SEPARATOR.'modules'.DIRECTORY_SEPARATOR)
                && ! str_contains($item['file'], DIRECTORY_SEPARATOR.'modules'.DIRECTORY_SEPARATOR.'Core'.DIRECTORY_SEPARATOR.'Logging'.DIRECTORY_SEPARATOR));
            $module = null;
            if (isset($frame['file']) && preg_match('#/modules/([^/]+)/#', str_replace('\\', '/', $frame['file']), $matches)) {
                $module = $matches[1];
            }

            return $record->with(extra: [
                ...$record->extra,
                'uuid' => $record->context['uuid'] ?? $record->context['request_uuid'] ?? null,
                'module' => $module,
                'file' => $frame['file'] ?? null,
                'line' => $frame['line'] ?? null,
            ]);
        });
    }
}
