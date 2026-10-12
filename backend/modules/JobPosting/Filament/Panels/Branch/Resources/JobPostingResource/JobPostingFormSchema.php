<?php

declare(strict_types=1);

namespace Modules\JobPosting\Filament\Panels\Branch\Resources\JobPostingResource;

use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Modules\JobPosting\Enums\JobPostingStatusEnum;

final class JobPostingFormSchema
{
    public static function make(Form $form): Form
    {
        return $form->schema([
            Section::make(__('jobposting::ui.job_posting'))
                ->columns(2)
                ->schema([
                    TextInput::make('title.en')
                        ->label(__('jobposting::ui.title_english'))
                        ->required(),
                    TextInput::make('title.ar')
                        ->label(__('jobposting::ui.title_arabic'))
                        ->required(),
                    Textarea::make('description.en')
                        ->label(__('jobposting::ui.description_english'))
                        ->rows(4)
                        ->required(),
                    Textarea::make('description.ar')
                        ->label(__('jobposting::ui.description_arabic'))
                        ->rows(4)
                        ->required(),
                    Select::make('status')
                        ->options(JobPostingStatusEnum::class)
                        ->required()
                        ->default(JobPostingStatusEnum::Open),
                ]),
        ]);
    }
}
