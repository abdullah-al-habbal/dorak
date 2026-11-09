<?php

declare(strict_types=1);

/*
 * Readable names for translatable request fields, so a message says "The English name field is required."
 * instead of "The name.en field is required.". BaseApiFormRequest::attributes() applies them to every API request.
 * English only: validation messages are English in every locale today, and Arabic names would mix languages.
 */
return [
    'attributes' => [
        'name.en' => 'English name',
        'name.ar' => 'Arabic name',
        'description.en' => 'English description',
        'description.ar' => 'Arabic description',
        'title.en' => 'English title',
        'title.ar' => 'Arabic title',
        'requirements.en' => 'English requirements',
        'requirements.ar' => 'Arabic requirements',
        'address.en' => 'English address',
        'address.ar' => 'Arabic address',
        'bio.en' => 'English bio',
        'bio.ar' => 'Arabic bio',
    ],
];
