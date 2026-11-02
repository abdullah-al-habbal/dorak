<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Filament\Panels\Admin\Resources\BarberAffiliationResource;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\MorphToSelect;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\Brand\Models\BrandModel;

final class BarberAffiliationFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    Select::make('barber_id')
                        ->relationship('barber', 'email')
                        ->required(),
                    MorphToSelect::make('affiliable')
                        ->label(__('barberaffiliation::ui.entity'))
                        ->types([
                            MorphToSelect\Type::make(BrandModel::class)
                                ->titleAttribute('name.en'),
                        ])
                        ->required(),
                    Select::make('status')
                        ->options(AffiliationStatus::class)
                        ->required(),
                    TextInput::make('commission_percent')
                        ->numeric()
                        ->step('0.01')
                        ->suffix('%'),
                    DateTimePicker::make('invited_at'),
                    DateTimePicker::make('accepted_at'),
                    DateTimePicker::make('terminated_at'),
                ]),
        ]);
    }
}
