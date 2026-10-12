<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Admin\Resources\JobPostingResource;

use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;

final class JobPostingFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make()
                ->columns(2)
                ->schema([
                    TextInput::make('title.en')
                        ->label(__('jobposting::ui.title_english'))
                        ->required(),
                    TextInput::make('title.ar')
                        ->label(__('jobposting::ui.title_arabic'))
                        ->required(),
                    Select::make('branch_id')
                        ->relationship('branch', 'name.en')
                        ->required(),
                    Select::make('status')
                        ->options([
                            'open' => 'Open',
                            'closed' => 'Closed',
                        ])
                        ->required(),
                ]),
            Section::make(__('jobposting::ui.description'))
                ->schema([
                    RichEditor::make('description.en')
                        ->label(__('jobposting::ui.description_english')),
                    RichEditor::make('description.ar')
                        ->label(__('jobposting::ui.description_arabic')),
                ]),
        ]);
    }
}
