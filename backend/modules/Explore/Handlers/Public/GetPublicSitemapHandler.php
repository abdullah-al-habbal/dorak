<?php

declare(strict_types=1);

namespace Modules\Explore\Handlers\Public;

use Modules\Explore\Eloquent\Resolvers\Public\GetPublicSitemapEloquentResolver;

final class GetPublicSitemapHandler
{
    public function __construct(
        private readonly GetPublicSitemapEloquentResolver $resolver,
    ) {}

    /** @return array<string, list<array{slug: string, updated_at: ?string}>> */
    public function handle(): array
    {
        return $this->resolver->resolve();
    }
}
