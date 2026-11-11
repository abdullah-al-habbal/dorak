<?php

// tests/Unit/Barber/Models/BarberModelTest.php
declare(strict_types=1);

use Modules\Barber\Models\BarberModel;

it('stores translatable name', function () {
    $barber = new BarberModel([
        'name' => ['en' => 'John', 'ar' => 'جون'],
        'email' => 'john@example.com',
    ]);

    expect($barber->getTranslation('name', 'en'))->toBe('John');
    expect($barber->getTranslation('name', 'ar'))->toBe('جون');
});
