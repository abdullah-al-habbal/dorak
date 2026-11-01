<?php

declare(strict_types=1);

namespace Modules\Brand\Filament\Panels\Admin\Resources\BrandResource;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;

final class BrandFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('brand::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('brand::ui.name_arabic'))
                        ->required(),
                    Select::make('owner_id')
                        ->relationship('owner', 'email')
                        ->required(),
                    Select::make('base_currency_code')
                        ->relationship('baseCurrency', 'code')
                        ->required(),
                    TextInput::make('logo')
                        ->url(),
                ]),
            Section::make(__('brand::ui.description'))
                ->schema([
                    RichEditor::make('description.en')
                        ->label(__('brand::ui.description_english')),
                    RichEditor::make('description.ar')
                        ->label(__('brand::ui.description_arabic')),
                ]),
        ]);
    }
}
