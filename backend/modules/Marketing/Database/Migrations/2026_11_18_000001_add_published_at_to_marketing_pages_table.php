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
        Schema::table('marketing_pages', function (Blueprint $table): void {
            $table->timestamp('published_at')->nullable()->after('meta_description');
        });

        // Pages that exist before this column keep showing on the public site.
        DB::table('marketing_pages')->update(['published_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('marketing_pages', function (Blueprint $table): void {
            $table->dropColumn('published_at');
        });
    }
};
