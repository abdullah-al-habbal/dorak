<?php

declare(strict_types=1);

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Constants\UploadConstants;

/** T11.5: type, pixel size and storage disk of user uploads. */
beforeEach(function (): void {
    Queue::fake();
    Storage::fake('local');
    Storage::fake('public');
});

it('refuses a face photo with an absurd pixel size or a non-image file', function (): void {
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $tooWide = UploadedFile::fake()->image('wide.jpg', UploadConstants::UPLOAD_PHOTO_MAX_SIDE + 1, 10);
    $script = UploadedFile::fake()->create('face.php', 10, 'application/x-php');

    $this->postJson('/api/v1/client/face-profile', ['photo' => $tooWide])->assertUnprocessable()->assertJsonValidationErrors('photo');
    $this->postJson('/api/v1/client/face-profile', ['photo' => $script])->assertUnprocessable()->assertJsonValidationErrors('photo');
});

it('keeps an accepted face photo on the private disk only', function (): void {
    $this->actingAs(ClientModel::factory()->create(), 'client');

    $this->postJson('/api/v1/client/face-profile', ['photo' => UploadedFile::fake()->image('face.jpg', 400, 400)])->assertCreated();

    expect(Storage::disk('local')->allFiles('face-profiles'))->toHaveCount(1);
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
});

it('refuses a portfolio photo with an absurd pixel size, an svg or a non-image file', function (): void {
    $this->actingAs(BarberModel::factory()->create(), 'barber');

    foreach ([
        UploadedFile::fake()->image('wide.jpg', UploadConstants::UPLOAD_PHOTO_MAX_SIDE + 1, 10),
        UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>'),
        UploadedFile::fake()->create('shell.php', 10, 'application/x-php'),
    ] as $file) {
        $this->postJson('/api/v1/barber/portfolio', ['photo' => $file])->assertUnprocessable()->assertJsonValidationErrors('photo');
    }
});
