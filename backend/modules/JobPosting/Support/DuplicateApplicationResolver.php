<?php

declare(strict_types=1);

namespace Modules\JobPosting\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\JobPosting\Constants\JobPostingConstants;
use Modules\JobPosting\Enums\ApplicationStatus;
use RuntimeException;

/**
 * Resolves duplicate applications under the approved rule, without losing information.
 *
 * Keeper per (posting, barber) pair: highest status (Accepted > Seen > Submitted > Rejected), then the oldest
 * `created_at`, then the smallest id. Every other row is first copied, whole and with its original
 * `profile_snapshot`, into the archive table; the copy is read back and compared; only then are the originals
 * deleted by primary key. All of it runs in one transaction, so a failure leaves the data exactly as it was.
 * Inside that transaction every read is a locking read (`FOR UPDATE`): the status archived is the latest committed one
 * (a concurrent accept cannot be lost between the read and the delete), and writers wait until the transaction ends.
 * `status_change_logs` rows are never touched: they keep pointing at the removed ids, which stay resolvable in the archive.
 */
final class DuplicateApplicationResolver
{
    public function __construct(
        private readonly string $applications = JobPostingConstants::JOB_POSTING_APPLICATIONS_TABLE,
        private readonly string $archive = JobPostingConstants::JOB_POSTING_DUPLICATE_ARCHIVE_TABLE,
    ) {}

    /**
     * Read-only (a plain preview) unless `$lock`, which `resolve()` sets inside its transaction.
     *
     * @return list<array{job_posting_id: string, barber_id: string, keep: object, remove: list<object>}>
     */
    public function plan(bool $lock = false): array
    {
        $groups = [];

        foreach ((new DuplicateApplicationScanner)->duplicates($this->applications, $lock) as $pair) {
            $rows = DB::table($this->applications)
                ->where('job_posting_id', $pair['job_posting_id'])
                ->where('barber_id', $pair['barber_id'])
                ->when($lock, fn ($query) => $query->lockForUpdate())
                ->get()
                ->all();
            usort($rows, $this->keepFirst(...));

            $groups[] = [
                'job_posting_id' => $pair['job_posting_id'],
                'barber_id' => $pair['barber_id'],
                'keep' => $rows[0],
                'remove' => array_slice($rows, 1),
            ];
        }

        return $groups;
    }

    /** Archives and removes the duplicates. Returns how many rows were removed. */
    public function resolve(): int
    {
        return DB::transaction(function (): int {
            $groups = $this->plan(lock: true);
            $removeIds = [];

            foreach ($groups as $group) {
                foreach ($group['remove'] as $row) {
                    $this->archiveRow($row, (string) $group['keep']->id);
                    $removeIds[] = (string) $row->id;
                }
            }

            $this->verifyArchive($groups);

            foreach (array_chunk($removeIds, JobPostingConstants::JOB_POSTING_DUPLICATE_DELETE_CHUNK) as $chunk) {
                DB::table($this->applications)->whereIn('id', $chunk)->delete();
            }

            $this->verifyResult($groups);

            return count($removeIds);
        });
    }

    private function keepFirst(object $a, object $b): int
    {
        return [$this->priority($b), $this->timestamp($a), (string) $a->id]
            <=> [$this->priority($a), $this->timestamp($b), (string) $b->id];
    }

    /** Unknown statuses rank below every known one, so they are never kept over a real application. */
    private function priority(object $row): int
    {
        return ApplicationStatus::tryFrom((string) $row->status)?->retentionPriority() ?? -1;
    }

    private function timestamp(object $row): string
    {
        return (string) ($row->created_at ?? '9999-12-31 23:59:59');
    }

    private function archiveRow(object $row, string $keptId): void
    {
        DB::table($this->archive)->insert([
            'id' => (string) Str::uuid(),
            'original_id' => $row->id,
            'kept_application_id' => $keptId,
            'job_posting_id' => $row->job_posting_id,
            'barber_id' => $row->barber_id,
            'status' => $row->status,
            'profile_snapshot' => $row->profile_snapshot,
            'original_created_at' => $row->created_at,
            'original_updated_at' => $row->updated_at,
        ]);
    }

    /** @param  list<array{keep: object, remove: list<object>}>  $groups */
    private function verifyArchive(array $groups): void
    {
        foreach ($groups as $group) {
            foreach ($group['remove'] as $row) {
                $copy = DB::table($this->archive)->where('original_id', $row->id)->first();

                if ($copy === null
                    || json_decode((string) $copy->profile_snapshot, true) != json_decode((string) $row->profile_snapshot, true)
                    || $copy->status !== $row->status
                    || $copy->kept_application_id !== $group['keep']->id) {
                    throw new RuntimeException(sprintf('Archive copy of application %s does not match the original. Nothing was removed.', $row->id));
                }
            }
        }
    }

    /** @param  list<array{keep: object, remove: list<object>}>  $groups */
    private function verifyResult(array $groups): void
    {
        $remaining = (new DuplicateApplicationScanner)->duplicates($this->applications, lock: true);
        $keepers = array_map(fn (array $group): string => (string) $group['keep']->id, $groups);
        $present = DB::table($this->applications)->whereIn('id', $keepers)->count();

        if ($remaining !== [] || $present !== count($keepers)) {
            throw new RuntimeException('Duplicate resolution did not leave exactly one application per pair. Nothing was committed.');
        }
    }
}
