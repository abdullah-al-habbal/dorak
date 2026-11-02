<?php

declare(strict_types=1);

namespace Modules\Preference\Filament\Panels\Admin\Resources\PreferenceResource;

use Filament\Forms\Components\MorphToSelect;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Modules\Brand\Models\BrandModel;

final class PreferenceFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    MorphToSelect::make('preferenceable')
                        ->label(__('preference::ui.entity'))
                        ->types([
                            MorphToSelect\Type::make(BrandModel::class)
                                ->titleAttribute('name.en'),
                        ])
                        ->required(),
                    Select::make('preferred_language')
                        ->relationship('language', 'name.en'),
                    Select::make('display_currency_code')
                        ->relationship('displayCurrency', 'code'),
                    Toggle::make('allows_notifications'),
                    Select::make('theme_mode')
                        ->options([
                            'light' => 'Light',
                            'dark' => 'Dark',
                        ]),
                    Select::make('price_display_mode')
                        ->options([
                            'tax_inclusive' => 'Tax Inclusive',
                            'tax_exclusive' => 'Tax Exclusive',
                        ]),
                ]),
        ]);
    }
}
