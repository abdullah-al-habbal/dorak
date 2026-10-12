<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Filament\Panels\Admin\Resources\ServiceCatalogCategoryResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;

final class ServiceCatalogCategoryFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('servicecatalog::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('servicecatalog::ui.name_arabic'))
                        ->required(),
                    TextInput::make('slug')
                        ->required()
                        ->unique(ignoreRecord: true),
                    Toggle::make('is_active')
                        ->default(true),
                ]),
            Section::make(__('servicecatalog::ui.description'))
                ->schema([
                    TextInput::make('description.en')
                        ->label(__('servicecatalog::ui.description_english')),
                    TextInput::make('description.ar')
                        ->label(__('servicecatalog::ui.description_arabic')),
                ]),
        ]);
    }
}
