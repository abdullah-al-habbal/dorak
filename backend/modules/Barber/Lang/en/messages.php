<?php

declare(strict_types=1);

return [
    'not_member_of_branch' => 'The selected barber is not affiliated with this branch.',
    'registered_pending_approval' => 'Account created. It will be usable once an administrator approves it.',
    'email_verification_subject' => 'Verify your email address',
    'email_verification_body' => '<p>Your Dorak verification code: <strong>:code</strong></p><p>This code expires in 10 minutes.</p>',
    'review_not_pending' => 'This barber is not waiting for review.',
    'review_not_rejected' => 'Only a rejected account can be resubmitted.',
    'review_resubmission_limit' => 'The resubmission limit has been reached. Please contact support.',
    'review_approved' => 'Barber approved.',
    'review_rejected' => 'Barber rejected.',
    'review_resubmitted' => 'Your account was resubmitted for review.',
    'review_approved_subject' => 'Your Dorak account is approved',
    'review_approved_body' => '<p>Hello :name,</p><p>Your account was approved. You can now sign in to the stylist app.</p>',
    'review_rejected_subject' => 'Your Dorak account needs changes',
    'review_rejected_body' => '<p>Hello :name,</p><p>Your account was not approved. Reason: :reason</p><p>Update your profile in the stylist app and submit it again.</p>',
    'account_rejected' => 'Your account was not approved: :reason. Resubmit it after fixing your profile.',
    'activation_not_enabled' => 'Only an active barber can be deactivated.',
    'activation_not_disabled' => 'Only a deactivated barber can be reactivated.',
    'activation_not_approved' => 'A barber that is pending approval or was rejected cannot be switched on or off.',
    'activation_toggled' => 'Barber updated.',
    'deleted_barber_name' => 'Deleted stylist',
    'active_affiliation_block_deletion' => 'End your work with your brand or branch before deleting your account.',
];
