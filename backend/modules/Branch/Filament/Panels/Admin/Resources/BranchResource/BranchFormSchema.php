<?php

declare(strict_types=1);

namespace Modules\Branch\Filament\Panels\Admin\Resources\BranchResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Modules\Branch\Enums\BranchStatusEnum;

final class BranchFormSchema
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
                ]),
            Section::make(__('branch::ui.status'))
                ->schema([
                    Select::make('status')
                        ->options(BranchStatusEnum::class)
                        ->required(),
                ]),
        ]);
    }
}
