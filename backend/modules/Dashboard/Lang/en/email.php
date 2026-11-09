<?php

declare(strict_types=1);

return [
    'email_change_subject' => 'Confirm your Dorak email address',
    'email_change_body' => '<p>Your email-change confirmation code: <strong>:code</strong></p><p>This code expires in 10 minutes.</p>',
    'password_reset_subject' => 'Reset your Dorak password',
    'password_reset_body' => '<p>We received a request to reset your Dorak dashboard password.</p><p><a href=":url">Set a new password</a></p><p>This link expires in :minutes minutes and works once. If you didn’t ask for it, ignore this email and your password stays the same.</p>',
];
