<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The venue universe moves to the branch (A5, Task 44). Existing branches
     * inherit their brand's universe; the brand value stays as the default for
     * new branches.
     */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->string('universe', 16)->default('unisex')->index();
        });

        DB::table('branches')->update([
            'universe' => DB::raw('(select brands.universe from brands where brands.id = branches.brand_id)'),
        ]);
        DB::table('branches')->whereNull('universe')->update(['universe' => 'unisex']);
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropIndex(['universe']);
            $table->dropColumn('universe');
        });
    }
};
