<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dateTime('ends_at')->nullable()->after('time_slot');
            $table->index(['chair_id', 'time_slot', 'ends_at', 'status']);
            $table->index(['barber_id', 'time_slot', 'ends_at', 'status']);
        });

        // Historic bookings did not retain a duration snapshot. A zero-length
        // interval preserves their recorded start time while all new bookings
        // receive a server-derived end time.
        DB::table('bookings')->whereNull('ends_at')->update([
            'ends_at' => DB::raw('time_slot'),
        ]);

        Schema::table('bookings', function (Blueprint $table) {
            // @contract-migration: historical rows are backfilled before ends_at becomes required.
            $table->dateTime('ends_at')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['chair_id', 'time_slot', 'ends_at', 'status']);
            $table->dropIndex(['barber_id', 'time_slot', 'ends_at', 'status']);
            $table->dropColumn('ends_at');
        });
    }
};
