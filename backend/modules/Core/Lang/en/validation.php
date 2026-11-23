<?php

declare(strict_types=1);

/*
 * Readable names for translatable request fields, so a message says "The English name field is required."
 * instead of "The name.en field is required.". BaseApiFormRequest::attributes() applies them to every API request.
 * The Arabic file has the same keys.
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
        'group_name.en' => 'English group',
        'group_name.ar' => 'Arabic group',
        'body.en' => 'English content',
        'body.ar' => 'Arabic content',
        'author_title.en' => 'English author title',
        'author_title.ar' => 'Arabic author title',
        'meta_description.en' => 'English meta description',
        'meta_description.ar' => 'Arabic meta description',
        'subtitle.en' => 'English subtitle',
        'subtitle.ar' => 'Arabic subtitle',
        'tags.*.en' => 'English tag',
        'tags.*.ar' => 'Arabic tag',
    ],
];
