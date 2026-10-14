<?php

declare(strict_types=1);

namespace Modules\Core\Logging;

use Monolog\Formatter\JsonFormatter;
use Monolog\LogRecord;
use stdClass;
use Throwable;

final class StructuredJsonFormatter extends JsonFormatter
{
    /** @return array<array<mixed>|bool|float|int|stdClass|string|null> */
    protected function normalizeRecord(LogRecord $record): array
    {
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 30);
        $caller = collect($trace)->first(fn (array $frame): bool => isset($frame['file'])
            && str_contains($frame['file'], DIRECTORY_SEPARATOR.'modules'.DIRECTORY_SEPARATOR)
            && ! str_contains($frame['file'], DIRECTORY_SEPARATOR.'modules'.DIRECTORY_SEPARATOR.'Core'.DIRECTORY_SEPARATOR.'Logging'.DIRECTORY_SEPARATOR));
        $normalizedContext = $this->normalize($this->redact($record->context));
        $context = is_array($normalizedContext) ? $normalizedContext : [];
        $extra = $record->extra;
        $uuidValue = $context['uuid'] ?? $context['request_uuid'] ?? $extra['uuid'] ?? null;
        $moduleValue = $extra['module'] ?? $this->moduleFromPath($caller['file'] ?? null);
        $fileValue = $extra['file'] ?? $caller['file'] ?? null;
        $lineValue = $extra['line'] ?? $caller['line'] ?? null;

        return [
            'timestamp' => $record->datetime->format(DATE_ATOM),
            'level' => strtolower($record->level->getName()),
            'uuid' => is_string($uuidValue) ? $uuidValue : null,
            'module' => is_string($moduleValue) ? $moduleValue : null,
            'file' => is_string($fileValue) ? $fileValue : null,
            'line' => is_int($lineValue) ? $lineValue : null,
            'message' => $this->redactString($record->message),
            'context' => $context,
        ];
    }

    private function moduleFromPath(?string $path): ?string
    {
        if ($path === null || ! preg_match('#/modules/([^/]+)/#', str_replace('\\', '/', $path), $matches)) {
            return null;
        }

        return $matches[1];
    }

    private function redact(mixed $value, ?string $key = null): mixed
    {
        if ($key !== null && preg_match('/password|token|secret|authorization|cookie|credential|api[_-]?key|exception_message|email|phone|address/i', $key)) {
            return '[REDACTED]';
        }

        if ($value instanceof Throwable) {
            return ['type' => $value::class, 'message' => '[REDACTED EXCEPTION DETAILS]'];
        }

        if (! is_array($value)) {
            if (! is_string($value)) {
                return $value;
            }

            return $this->redactString($value);
        }

        $redacted = [];
        foreach ($value as $childKey => $child) {
            $redacted[$childKey] = $this->redact($child, is_string($childKey) ? $childKey : null);
        }

        return $redacted;
    }

    private function redactString(string $value): string
    {
        $redacted = preg_replace_callback(
            '/Bearer\s+[^\s]+|([\w.-]*(?:password|token|secret|api[_-]?key)\s*[=:]\s*)[^\s,;]+/i',
            fn (array $matches): string => isset($matches[1]) ? $matches[1].'[REDACTED]' : 'Bearer [REDACTED]',
            $value,
        ) ?? $value;

        return preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[REDACTED EMAIL]', $redacted) ?? $redacted;
    }
}
