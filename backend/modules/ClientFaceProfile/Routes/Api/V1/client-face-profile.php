<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Modules\Client\Http\Middleware\EnsureClientAccountAccess;
use Modules\ClientFaceProfile\Http\Actions\Client\DeleteFaceProfilePhotoAction;
use Modules\ClientFaceProfile\Http\Actions\Client\GetFaceBasedRecommendationsAction;
use Modules\ClientFaceProfile\Http\Actions\Client\ListFaceProfilePhotosAction;
use Modules\ClientFaceProfile\Http\Actions\Client\SetPrimaryFaceProfilePhotoAction;
use Modules\ClientFaceProfile\Http\Actions\Client\ShowFaceProfileAction;
use Modules\ClientFaceProfile\Http\Actions\Client\ShowFaceProfilePhotoAction;
use Modules\ClientFaceProfile\Http\Actions\Client\UploadFaceProfilePhotoAction;

Route::middleware(['auth:client', EnsureClientAccountAccess::class])->group(function () {
    Route::post('/client/face-profile', UploadFaceProfilePhotoAction::class)->name('client.face-profile.upload');
    Route::get('/client/face-profile', ListFaceProfilePhotosAction::class)->name('client.face-profile.list');
    Route::get('/client/face-profile/recommendations', GetFaceBasedRecommendationsAction::class)->name('client.face-profile.recommendations');
    Route::get('/client/face-profile/{profile}', ShowFaceProfileAction::class)->name('client.face-profile.show');
    Route::delete('/client/face-profile/{photo}', DeleteFaceProfilePhotoAction::class)->name('client.face-profile.delete');
    Route::patch('/client/face-profile/{photo}/primary', SetPrimaryFaceProfilePhotoAction::class)->name('client.face-profile.primary');
});

Route::get('/client/face-profile/{profile}/photo', ShowFaceProfilePhotoAction::class)
    ->middleware('signed')
    ->name('client.face-profile.photo');
