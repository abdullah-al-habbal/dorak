<?php

declare(strict_types=1);

namespace Modules\Core\Services;

/**
 * A notification text that is written in the language of whoever reads it: the inbox row in the
 * account's stored language, and each device push in that device's own language. The request
 * that raised the event belongs to another actor, so its locale is never used.
 */
final readonly class LocalizedNotificationMessage
{
    /**
     * @param  array<string, bool|float|int|string|null>  $bodyParameters
     */
    private function __construct(
        private ?string $titleKey,
        private ?string $bodyKey,
        private array $bodyParameters,
        private ?string $fixedTitle,
        private ?string $fixedBody,
    ) {}

    /**
     * @param  array<string, bool|float|int|string|null>  $bodyParameters
     */
    public static function translated(string $titleKey, string $bodyKey, array $bodyParameters = []): self
    {
        return new self($titleKey, $bodyKey, $bodyParameters, null, null);
    }

    /** Text that is already written; the same in every language. */
    public static function fixed(string $title, string $body): self
    {
        return new self(null, null, [], $title, $body);
    }

    public function title(string $locale): string
    {
        return $this->fixedTitle ?? trans((string) $this->titleKey, [], $locale);
    }

    public function body(string $locale): string
    {
        return $this->fixedBody ?? trans((string) $this->bodyKey, $this->bodyParameters, $locale);
    }
}
