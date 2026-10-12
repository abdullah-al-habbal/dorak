<?php

declare(strict_types=1);

namespace Modules\Currency\Filament\Panels\Admin\Resources\CurrencyResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;

final class CurrencyFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('code')
                        ->required()
                        ->maxLength(3)
                        ->unique(ignoreRecord: true),
                    TextInput::make('name.en')
                        ->label(__('currency::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('currency::ui.name_arabic'))
                        ->required(),
                    TextInput::make('symbol')
                        ->required()
                        ->maxLength(10),
                    Toggle::make('is_default'),
                ]),
        ]);
    }
}
