<?php

declare(strict_types=1);

namespace Modules\Client\Filament\Panels\Admin\Resources\ClientResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Modules\Client\Enums\ClientStatusEnum;

final class ClientFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('client::ui.name'))
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('client::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('client::ui.name_arabic'))
                        ->required(),
                ]),
            Section::make(__('client::ui.account'))
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
                    TextInput::make('phone')
                        ->tel(),
                ]),
            Section::make(__('client::ui.status'))
                ->schema([
                    Select::make('status')
                        ->options(ClientStatusEnum::class)
                        ->required(),
                ]),
        ]);
    }
}
