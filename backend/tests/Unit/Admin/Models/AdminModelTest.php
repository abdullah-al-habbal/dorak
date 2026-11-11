<?php

// tests/Unit/Admin/Models/AdminModelTest.php
declare(strict_types=1);

use Modules\Admin\Models\AdminModel;

it('stores translatable name', function () {
    $admin = new AdminModel([
        'name' => ['en' => 'Admin', 'ar' => 'مدير'],
        'email' => 'admin@example.com',
    ]);

    expect($admin->getTranslation('name', 'en'))->toBe('Admin');
    expect($admin->getTranslation('name', 'ar'))->toBe('مدير');
});
