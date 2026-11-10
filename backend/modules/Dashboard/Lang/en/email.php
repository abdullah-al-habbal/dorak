<?php

declare(strict_types=1);

return [
    'email_change_subject' => 'Confirm your Dorak email address',
    'email_change_body' => '<p>Your email-change confirmation code: <strong>:code</strong></p><p>This code expires in 10 minutes.</p>',
    'password_reset_subject' => 'Reset your Dorak password',
    'password_reset_body' => '<p>We received a request to reset your Dorak dashboard password.</p><p><a href=":url">Set a new password</a></p><p>This link expires in :minutes minutes and works once. If you didn’t ask for it, ignore this email and your password stays the same.</p>',
    'owner_brand_submitted_subject' => 'We received your Dorak business',
    'owner_brand_submitted_body' => '<p>Thanks for registering <strong>:name</strong> on Dorak. Your email is confirmed and your business is now waiting for review.</p><p>While you wait, you can complete your brand profile and prepare your first branch. <a href=":url">Open your dashboard</a>.</p>',
    'owner_brand_approved_subject' => 'Your Dorak business is approved',
    'owner_brand_approved_body' => '<p>Good news: <strong>:name</strong> has been approved. You can now add stylists and open your branch to clients.</p><p><a href=":url">Open your dashboard</a></p>',
    'owner_brand_rejected_subject' => 'Your Dorak business needs changes',
    'owner_brand_rejected_body' => '<p>We could not approve <strong>:name</strong> yet.</p><p>Reason: :reason</p><p>Please fix it and send it again. <a href=":url">Open your dashboard</a></p>',
];
