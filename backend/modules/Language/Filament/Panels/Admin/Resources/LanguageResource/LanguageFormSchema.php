<?php

declare(strict_types=1);

namespace Modules\Language\Filament\Panels\Admin\Resources\LanguageResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Modules\Language\Enums\TextDirectionEnum;

final class LanguageFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('code')
                        ->required()
                        ->maxLength(2)
                        ->unique(ignoreRecord: true),
                    TextInput::make('name.en')
                        ->label(__('language::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('language::ui.name_arabic'))
                        ->required(),
                    Select::make('direction')
                        ->options(TextDirectionEnum::class)
                        ->required(),
                    Toggle::make('is_default'),
                ]),
        ]);
    }
}
