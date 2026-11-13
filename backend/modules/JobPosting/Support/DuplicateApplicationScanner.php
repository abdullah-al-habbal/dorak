<?php

declare(strict_types=1);

namespace Modules\JobPosting\Support;

use Illuminate\Support\Facades\DB;
use RuntimeException;

/** Finds barbers who applied more than once to the same posting, before the unique index can be added. */
final class DuplicateApplicationScanner
{
    /** @return list<array{job_posting_id: string, barber_id: string, total: int}> */
    public function duplicates(string $table = 'job_applications'): array
    {
        return DB::table($table)
            ->select('job_posting_id', 'barber_id', DB::raw('COUNT(*) as total'))
            ->groupBy('job_posting_id', 'barber_id')
            ->havingRaw('COUNT(*) > 1')
            ->orderBy('job_posting_id')
            ->get()
            ->map(fn (object $row): array => [
                'job_posting_id' => (string) $row->job_posting_id,
                'barber_id' => (string) $row->barber_id,
                'total' => (int) $row->total,
            ])
            ->all();
    }

    /** Stops with the affected pairs when duplicates exist. Read-only: nothing is changed or deleted. */
    public function ensureNone(string $table = 'job_applications'): void
    {
        $duplicates = $this->duplicates($table);

        if ($duplicates === []) {
            return;
        }

        throw new RuntimeException(sprintf(
            '%s holds %d (posting, barber) pair(s) with more than one application, e.g. %s. Resolve them first: '
            .'SELECT job_posting_id, barber_id, COUNT(*) FROM %s GROUP BY job_posting_id, barber_id HAVING COUNT(*) > 1; '
            .'keep one row per pair, then migrate again. Nothing was changed.',
            $table,
            count($duplicates),
            json_encode(array_slice($duplicates, 0, 3)),
            $table,
        ));
    }
}
