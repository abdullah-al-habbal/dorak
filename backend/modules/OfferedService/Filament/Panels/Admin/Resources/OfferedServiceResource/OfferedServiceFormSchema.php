<?php

declare(strict_types=1);

namespace Modules\OfferedService\Filament\Panels\Admin\Resources\OfferedServiceResource;

use Filament\Forms\Components\MorphToSelect;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Modules\Brand\Models\BrandModel;

final class OfferedServiceFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('name.en')
                        ->label(__('offeredservice::ui.name_english'))
                        ->required(),
                    TextInput::make('name.ar')
                        ->label(__('offeredservice::ui.name_arabic'))
                        ->required(),
                    MorphToSelect::make('serviceable')
                        ->label(__('offeredservice::ui.entity'))
                        ->types([
                            MorphToSelect\Type::make(BrandModel::class)
                                ->titleAttribute('name.en'),
                        ])
                        ->required(),
                    Select::make('currency_code')
                        ->relationship('currency', 'code')
                        ->required(),
                    TextInput::make('price_amount_minor')
                        ->numeric()
                        ->integer()
                        ->required(),
                    TextInput::make('duration_minutes')
                        ->numeric()
                        ->required()
                        ->suffix('min'),
                    Toggle::make('is_at_home'),
                    Toggle::make('is_active')
                        ->default(true),
                ]),
            Section::make(__('offeredservice::ui.description'))
                ->schema([
                    RichEditor::make('description.en')
                        ->label(__('offeredservice::ui.description_english')),
                    RichEditor::make('description.ar')
                        ->label(__('offeredservice::ui.description_arabic')),
                ]),
        ]);
    }
}
