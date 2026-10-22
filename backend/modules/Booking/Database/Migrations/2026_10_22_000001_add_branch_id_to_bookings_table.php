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
        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignUuid('branch_id')->nullable()->after('chair_id')->constrained('branches')->nullOnDelete();
            $table->index(['branch_id', 'time_slot']);
        });

        DB::table('bookings')
            ->whereNotNull('chair_id')
            ->update(['branch_id' => DB::table('chairs')->select('branch_id')->whereColumn('chairs.id', 'bookings.chair_id')]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('branch_id');
        });
    }
};
