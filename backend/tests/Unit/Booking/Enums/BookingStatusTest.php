<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;

it('matches the complete booking transition matrix', function (): void {
    $matrix = [
        BookingStatus::Pending->value => [BookingStatus::Confirmed, BookingStatus::Cancelled],
        BookingStatus::Confirmed->value => [BookingStatus::InProgress, BookingStatus::Cancelled, BookingStatus::NoShow],
        BookingStatus::InProgress->value => [BookingStatus::Completed, BookingStatus::Cancelled, BookingStatus::NoShow],
        BookingStatus::Completed->value => [],
        BookingStatus::Cancelled->value => [],
        BookingStatus::NoShow->value => [],
    ];

    foreach ($matrix as $current => $allowedTargets) {
        foreach (BookingStatus::cases() as $target) {
            expect(BookingStatus::from($current)->canTransitionTo($target))
                ->toBe(in_array($target, $allowedTargets, true));
        }
    }
});
