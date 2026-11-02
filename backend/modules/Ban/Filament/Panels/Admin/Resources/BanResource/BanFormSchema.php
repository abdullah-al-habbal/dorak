<?php

declare(strict_types=1);

namespace Modules\Ban\Filament\Panels\Admin\Resources\BanResource;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\MorphToSelect;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Form;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;

final class BanFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    MorphToSelect::make('bannable')
                        ->label(__('ban::ui.entity'))
                        ->types([
                            MorphToSelect\Type::make(ClientModel::class)
                                ->titleAttribute('email'),
                            MorphToSelect\Type::make(BarberModel::class)
                                ->titleAttribute('email'),
                            MorphToSelect\Type::make(BranchModel::class)
                                ->titleAttribute('email'),
                        ])
                        ->required(),
                    Textarea::make('reason')
                        ->rows(3),
                    DateTimePicker::make('banned_at')
                        ->required()
                        ->default(now()),
                    DateTimePicker::make('expires_at')
                        ->helperText(__('ban::ui.leave_empty_for_permanent_ban')),
                ]),
        ]);
    }
}
