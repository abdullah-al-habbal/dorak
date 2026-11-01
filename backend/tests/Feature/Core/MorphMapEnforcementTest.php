<?php

declare(strict_types=1);

use Illuminate\Database\ClassMorphViolationException;
use Illuminate\Database\Eloquent\Relations\Relation;
use Modules\Core\Constants\MorphMapConstants;
use Modules\Review\Models\ReviewModel;

it('registers every morph alias enum case against its model', function (): void {
    foreach (MorphMapConstants::MORPH_ALIAS_ENUMS as $enum) {
        foreach ($enum::cases() as $case) {
            expect(Relation::getMorphedModel($case->value))->toBe($case->modelClass());
        }
    }
});

it('requires the morph map so unmapped models cannot be persisted by class name', function (): void {
    expect(Relation::requiresMorphMap())->toBeTrue();

    expect(fn () => (new class extends ReviewModel
    {
        protected $table = 'reviews';
    })->getMorphClass())->toThrow(ClassMorphViolationException::class);
});
