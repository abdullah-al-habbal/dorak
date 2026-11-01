<?php

// modules/Barber/Filament/Panels/Admin/Resources/BarberResource/BarberFormSchema.php
declare(strict_types=1);

namespace Modules\Barber\Filament\Panels\Admin\Resources\BarberResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Modules\Barber\Enums\BarberStatusEnum;

final class BarberFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('barber::ui.name'))
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('barber::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('barber::ui.name_arabic'))
                        ->required(),
                ]),
            Section::make(__('barber::ui.account'))
                ->columns(2)
                ->schema([
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                    TextInput::make('password')
                        ->password()
                        ->dehydrated(fn (?string $state): bool => filled($state))
                        ->required(fn (string $operation): bool => $operation === 'create'),
                    Toggle::make('is_freelancer'),
                ]),
            Section::make(__('barber::ui.status'))
                ->schema([
                    Select::make('status')
                        ->options(BarberStatusEnum::class)
                        ->required(),
                ]),
        ]);
    }
}
