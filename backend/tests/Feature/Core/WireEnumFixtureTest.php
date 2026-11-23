<?php

declare(strict_types=1);

use Modules\Barber\Enums\BarberStatusEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Branch\Enums\BranchHoursSource;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Enums\FloorZone;
use Modules\ClientFaceProfile\Enums\FaceAnalysisStatusEnum;
use Modules\Core\Enums\VenueUniverse;
use Modules\JobPosting\Enums\ApplicationStatus;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;

/*
 * D2: the dashboard (Vitest) and the mobile apps (flutter test) read tests/Fixtures/wire-enums.json and fail when
 * their own enums stop covering a backend value. This test keeps the fixture equal to the backend enums, so a new
 * backend case fails here first. Regenerate with: UPDATE_WIRE_ENUMS=1 vendor/bin/pest tests/Feature/Core/WireEnumFixtureTest.php
 */

/** @return array<string, list<string>> */
function wireEnumCases(): array
{
    $enums = [
        'BarberStatus' => BarberStatusEnum::class,
        'AffiliationStatus' => AffiliationStatus::class,
        'BookingStatus' => BookingStatus::class,
        'BranchHoursSource' => BranchHoursSource::class,
        'BranchStatus' => BranchStatusEnum::class,
        'BrandStatus' => BrandStatusEnum::class,
        'ChairStatus' => ChairStatus::class,
        'FloorZone' => FloorZone::class,
        'FaceAnalysisStatus' => FaceAnalysisStatusEnum::class,
        'VenueUniverse' => VenueUniverse::class,
        'ApplicationStatus' => ApplicationStatus::class,
        'ReviewStatus' => ReviewStatus::class,
        'ReviewSubjectType' => ReviewSubjectTypeEnum::class,
    ];

    return array_map(fn (string $enum): array => array_map(fn (BackedEnum $case): string => (string) $case->value, $enum::cases()), $enums);
}

it('keeps the shared wire enum fixture equal to the backend enums', function (): void {
    $path = base_path('tests/Fixtures/wire-enums.json');
    $current = wireEnumCases();

    if (getenv('UPDATE_WIRE_ENUMS') === '1') {
        file_put_contents($path, json_encode($current, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");
    }

    expect(json_decode((string) file_get_contents($path), true))->toBe($current);
});
