<?php

declare(strict_types=1);

namespace Modules\Marketing\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Storage;

/**
 * An image reference for the public website: a path on this site (`/images/hero.jpg`) or an
 * https URL on a trusted host (this site, the public disk, or `marketing.trusted_media_hosts`).
 * Anything else (`javascript:`, `data:`, protocol-relative, foreign hosts, `..` segments) is
 * refused. A value that is already stored may be saved again unchanged, so a legacy value
 * never blocks an unrelated edit.
 */
final readonly class TrustedMediaUrlRule implements ValidationRule
{
    private const string SITE_PATH_PATTERN = '#^/(?!/)[A-Za-z0-9._~%/-]+$#';

    public function __construct(private ?string $current = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '' || $value === $this->current) {
            return;
        }

        if (! is_string($value) || ! $this->isTrusted($value)) {
            $fail(__('marketing::marketing.media_url_untrusted'));
        }
    }

    private function isTrusted(string $value): bool
    {
        if (str_starts_with($value, '/')) {
            return preg_match(self::SITE_PATH_PATTERN, $value) === 1 && ! in_array('..', explode('/', $value), true);
        }

        $parts = parse_url($value);
        if ($parts === false || ($parts['scheme'] ?? '') !== 'https' || isset($parts['user']) || isset($parts['port'])) {
            return false;
        }

        return in_array(strtolower((string) ($parts['host'] ?? '')), $this->trustedHosts(), true);
    }

    /** @return list<string> */
    private function trustedHosts(): array
    {
        $hosts = [
            parse_url((string) config('app.url'), PHP_URL_HOST),
            parse_url(Storage::disk('public')->url('/'), PHP_URL_HOST),
            ...(array) config('marketing.trusted_media_hosts', []),
        ];

        return array_values(array_unique(array_map(
            static fn (mixed $host): string => strtolower((string) $host),
            array_filter($hosts, static fn (mixed $host): bool => is_string($host) && $host !== ''),
        )));
    }
}
