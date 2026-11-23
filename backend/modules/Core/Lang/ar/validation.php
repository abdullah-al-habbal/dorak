<?php

declare(strict_types=1);

/*
 * Readable names for translatable request fields, so a message says "حقل الاسم بالإنجليزية مطلوب."
 * instead of "name.en". BaseApiFormRequest::attributes() applies them to every API request.
 * The English file has the same keys.
 */
return [
    'attributes' => [
        'name.en' => 'الاسم بالإنجليزية',
        'name.ar' => 'الاسم بالعربية',
        'description.en' => 'الوصف بالإنجليزية',
        'description.ar' => 'الوصف بالعربية',
        'title.en' => 'العنوان بالإنجليزية',
        'title.ar' => 'العنوان بالعربية',
        'requirements.en' => 'المتطلبات بالإنجليزية',
        'requirements.ar' => 'المتطلبات بالعربية',
        'address.en' => 'العنوان بالإنجليزية',
        'address.ar' => 'العنوان بالعربية',
        'bio.en' => 'النبذة بالإنجليزية',
        'bio.ar' => 'النبذة بالعربية',
        'group_name.en' => 'المجموعة بالإنجليزية',
        'group_name.ar' => 'المجموعة بالعربية',
        'body.en' => 'المحتوى بالإنجليزية',
        'body.ar' => 'المحتوى بالعربية',
        'author_title.en' => 'صفة الكاتب بالإنجليزية',
        'author_title.ar' => 'صفة الكاتب بالعربية',
        'meta_description.en' => 'وصف محركات البحث بالإنجليزية',
        'meta_description.ar' => 'وصف محركات البحث بالعربية',
        'subtitle.en' => 'العنوان الفرعي بالإنجليزية',
        'subtitle.ar' => 'العنوان الفرعي بالعربية',
        'tags.*.en' => 'الوسم بالإنجليزية',
        'tags.*.ar' => 'الوسم بالعربية',
    ],
];
