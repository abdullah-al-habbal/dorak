<?php

declare(strict_types=1);

namespace Modules\Barber\Filament\Panels\Barber\Resources\ProfileResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;

final class ProfileFormSchema
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
                ->schema([
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                    TextInput::make('password')
                        ->password()
                        ->dehydrated(fn (?string $state): bool => filled($state))
                        ->helperText(__('barber::ui.leave_empty_to_keep_current_password')),
                ]),
        ]);
    }
}
