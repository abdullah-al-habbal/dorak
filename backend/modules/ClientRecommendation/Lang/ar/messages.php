<?php

declare(strict_types=1);

return [
    'cli_description' => 'إعادة حساب متجهات تفضيلات العملاء من إشارات التفاعل',
    'cli_client_id_option' => 'إعادة حساب متجه عميل واحد باستخدام UUID',
    'cli_force_option' => 'تخطي التحقق من حداثة البيانات',
    'cli_recomputing_client' => 'جارٍ إعادة حساب متجه العميل: :client_id',
    'cli_recomputing_all_clients' => 'جارٍ إعادة حساب متجهات جميع العملاء الذين لديهم إشارات...',
    'cli_done' => 'اكتمل.',
    'cli_embedding_missing' => 'لم يتم إرجاع تضمين لـ :entity_type: :entity_id',
    'cli_embedding_computed' => 'تم حساب التضمين لـ :entity_type: :entity_id',
    'cli_embedding_failed' => 'فشل :entity_type :entity_id: :reason',
    'cli_client_embedding_missing' => 'لم يتم إرجاع تضمين للعميل: :client_id',
    'cli_client_vector_computed' => 'تم حساب متجه العميل: :client_id',
    'cli_client_vector_failed' => 'فشل حساب متجه العميل :client_id: :reason',
];
