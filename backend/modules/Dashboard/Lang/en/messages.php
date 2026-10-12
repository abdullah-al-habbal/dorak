<?php

declare(strict_types=1);

return [
    'chair_stylist_unavailable' => 'The selected chair or stylist is no longer available for this time.',
    'invalid_booking_status' => 'Invalid booking status.',
    'assign_branch_chair' => 'A branch manager must assign a branch chair.',
    'booking_slot_conflict' => 'The booking time conflicts with an existing booking.',
    'current_password_incorrect' => 'Current password is incorrect.',
    'email_already_in_use' => 'This email address is already in use.',
    'invalid_confirmation_code' => 'The confirmation code is invalid or expired.',
    'barber_other_branch' => 'The barber belongs to another branch.',
    'chair_has_active_bookings' => 'The chair has active bookings and cannot be changed or deleted.',
    'stylist_not_assigned_to_chair' => 'The stylist must be assigned to the selected chair.',
    'services_unavailable_for_branch' => 'Every service must be available to the selected branch.',
    'barber_operation_unavailable' => 'This dashboard operation is not available to barbers.',
    'refresh_ttl_invalid' => 'DASHBOARD_REFRESH_TTL_SECONDS must be at least 3600 seconds.',
    'session_secret_invalid' => 'DASHBOARD_SESSION_SECRET must be at least 32 characters.',
    'claim_ttl_invalid' => 'DASHBOARD_CLAIM_TTL_SECONDS must be at least 60 seconds.',
    'claim_encoding_failed' => 'Unable to encode dashboard claim.',
    'actor_type_unsupported' => 'Unsupported dashboard actor type: :actor_type',
    'guard_unsupported' => 'Unsupported dashboard guard.',
    'booking_time_overlap' => 'The selected time overlaps an active booking.',
    'chair_has_active_or_future_bookings' => 'Chair has active or future bookings.',
];
