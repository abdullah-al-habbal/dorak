<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

/** Why push delivery cannot run. Logged as the `reason`; it never carries a secret. */
enum FcmConfigurationProblemEnum: string
{
    case ProjectIdMissing = 'project_id_missing';
    case CredentialsMissing = 'credentials_missing';
    case CredentialsUnreadable = 'credentials_unreadable';
    case CredentialsInvalid = 'credentials_invalid';
}
