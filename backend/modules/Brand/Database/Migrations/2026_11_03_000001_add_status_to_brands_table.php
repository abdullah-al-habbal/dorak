<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Brand\Enums\BrandStatusEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table): void {
            $table->string('status', 20)->default(BrandStatusEnum::Pending->value)->after('universe')->index();
        });

        // Brands that existed before the approval gate were already operating.
        DB::table('brands')->update(['status' => BrandStatusEnum::Active->value]);
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table): void {
            $table->dropColumn('status');
        });
    }
};
