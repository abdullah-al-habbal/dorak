<?php

declare(strict_types=1);

namespace Modules\JobPosting\Constants;

final class JobPostingConstants
{
    public const int JOB_POSTING_APPLICATIONS_DEFAULT_PER_PAGE = 15;

    public const int JOB_POSTING_APPLICATIONS_MAX_PER_PAGE = 100;

    public const string JOB_POSTING_APPLICATIONS_TABLE = 'job_applications';

    /** Holds every application removed as a duplicate, with its full profile snapshot, so nothing is lost. */
    public const string JOB_POSTING_DUPLICATE_ARCHIVE_TABLE = 'job_application_duplicate_archives';

    public const string JOB_POSTING_RESOLVE_DUPLICATES_COMMAND = 'job-applications:resolve-duplicates';

    public const string JOB_POSTING_VERIFY_INDEX_COMMAND = 'job-applications:verify-unique-index';

    public const string JOB_POSTING_UNIQUE_INDEX = 'job_applications_posting_barber_unique';

    public const int JOB_POSTING_DUPLICATE_DELETE_CHUNK = 500;

    /** Resolve-then-index attempts: a duplicate written between the two steps by a request still in flight is resolved by the next attempt. */
    public const int JOB_POSTING_INDEX_ATTEMPTS = 3;

    /** Process environment variable the deploy sets for its pre-swap `migrate`, so contract migrations wait for the post-swap run. */
    public const string JOB_POSTING_DEFER_CONTRACT_ENV = 'DEFER_CONTRACT_MIGRATIONS';
}
