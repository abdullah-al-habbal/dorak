<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Barber\Models\BarberModel;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barber_affiliations', function (Blueprint $table): void {
            $table->string('initiated_by_type')->nullable()->after('barber_id');
            $table->uuid('initiated_by_id')->nullable()->after('initiated_by_type');
        });

        DB::table('barber_affiliations')->update([
            'initiated_by_type' => BarberModel::class,
            'initiated_by_id' => DB::raw('barber_id'),
        ]);
    }

    public function down(): void
    {
        Schema::table('barber_affiliations', function (Blueprint $table): void {
            $table->dropColumn(['initiated_by_type', 'initiated_by_id']);
        });
    }
};
