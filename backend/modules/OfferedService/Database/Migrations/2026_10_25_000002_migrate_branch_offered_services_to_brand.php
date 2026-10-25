<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * D1 (Task 54): a Service is owned by either a Brand or a Barber — never a
 * Branch. Reassigns every branch-owned offered_services row to the parent
 * brand before `branch` is removed from the allowed serviceable_type values.
 *
 * Irreversible: the original branch ownership is not recoverable once rows
 * are folded into their brand, so down() is a no-op.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('branches')->select('id', 'brand_id')->orderBy('id')->each(function (object $branch): void {
            DB::table('offered_services')
                ->where('serviceable_type', 'branch')
                ->where('serviceable_id', $branch->id)
                ->update([
                    'serviceable_id' => $branch->brand_id,
                    'serviceable_type' => 'brand',
                ]);
        });
    }

    public function down(): void {}
};
