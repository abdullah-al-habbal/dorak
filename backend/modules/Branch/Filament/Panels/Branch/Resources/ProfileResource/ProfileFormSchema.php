<?php

declare(strict_types=1);

namespace Modules\Branch\Filament\Panels\Branch\Resources\ProfileResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;

final class ProfileFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('branch::ui.name'))
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('branch::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('branch::ui.name_arabic'))
                        ->required(),
                ]),
            Section::make(__('branch::ui.account'))
                ->schema([
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                    TextInput::make('password')
                        ->password()
                        ->dehydrated(fn (?string $state): bool => filled($state))
                        ->helperText(__('branch::ui.leave_empty_to_keep_current_password')),
                    TextInput::make('phone')
                        ->tel(),
                ]),
        ]);
    }
}
