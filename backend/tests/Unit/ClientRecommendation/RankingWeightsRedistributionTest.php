<?php

declare(strict_types=1);

use Modules\ClientRecommendation\Constants\RecommendationConstants;
use Modules\ClientRecommendation\ValuesObjects\RecommendationFactorWeightsValueObject;

it('redistributes alpha proportionally so the weights still sum to one', function (array $weights): void {
    $without = RecommendationFactorWeightsValueObject::fromArray($weights)->withoutAlpha();

    expect($without->alpha())->toBe(0.0)
        ->and(round($without->total(), 10))->toBe(1.0)
        ->and(round($without->beta() / $without->geographic(), 10))
        ->toBe(round($weights['beta'] / $weights['geographic'], 10));
})->with([
    'default' => [RecommendationConstants::RECOMMENDATION_DEFAULT_WEIGHTS],
    'factor-weights-v2' => [RecommendationConstants::RECOMMENDATION_FACTOR_WEIGHTS_V2],
]);

it('leaves weights without alpha unchanged', function (): void {
    $weights = RecommendationFactorWeightsValueObject::fromArray(['alpha' => 0.0, 'beta' => 0.5, 'gamma' => 0.2]);

    expect($weights->withoutAlpha()->toArray())->toBe($weights->toArray());
});
