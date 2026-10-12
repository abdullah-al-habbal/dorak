<?php

// modules/Admin/Filament/Panels/Admin/Resources/AdminUserResource/AdminUserFormSchema.php
declare(strict_types=1);

namespace Modules\Admin\Filament\Panels\Admin\Resources\AdminUserResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Forms\Set;
use Illuminate\Support\Str;

final class AdminUserFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('admin::ui.name'))
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('admin::ui.name_english'))
                        ->required()
                        ->live(true)
                        ->afterStateUpdated(fn (Set $set, ?string $state) => $set('email', $state ? Str::slug($state).'@dorak.sy' : null)),
                    TextInput::make('name.ar')
                        ->label(__('admin::ui.name_arabic'))
                        ->required(),
                ]),
            Section::make(__('admin::ui.account'))
                ->schema([
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                    TextInput::make('password')
                        ->password()
                        ->dehydrated(fn (?string $state): bool => filled($state))
                        ->required(fn (string $operation): bool => $operation === 'create'),
                ]),
        ]);
    }
}
