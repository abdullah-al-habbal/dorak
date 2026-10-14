<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;

it('matches the complete booking transition matrix', function (): void {
    $matrix = [
        BookingStatus::Pending->value => [BookingStatus::Confirmed, BookingStatus::Canceled],
        BookingStatus::Confirmed->value => [BookingStatus::InProgress, BookingStatus::Canceled, BookingStatus::NoShow],
        BookingStatus::InProgress->value => [BookingStatus::Completed, BookingStatus::Canceled, BookingStatus::NoShow],
        BookingStatus::Completed->value => [],
        BookingStatus::Canceled->value => [],
        BookingStatus::NoShow->value => [],
    ];

    foreach ($matrix as $current => $allowedTargets) {
        foreach (BookingStatus::cases() as $target) {
            expect(BookingStatus::from($current)->canTransitionTo($target))
                ->toBe(in_array($target, $allowedTargets, true));
        }
    }
});
