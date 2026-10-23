<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /** A unique, URL-safe brand slug from `name.en` (Task 49); existing brands are backfilled. */
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table): void {
            $table->string('slug', 160)->nullable()->unique()->after('name');
        });

        $taken = [];
        DB::table('brands')->orderBy('created_at')->orderBy('id')->select(['id', 'name'])->get()
            ->each(function (object $brand) use (&$taken): void {
                $name = json_decode((string) $brand->name, true);
                $base = Str::slug(is_array($name) ? (string) ($name['en'] ?? reset($name) ?: '') : '') ?: 'brand';
                $slug = $base;
                for ($suffix = 2; isset($taken[$slug]); $suffix++) {
                    $slug = "{$base}-{$suffix}";
                }
                $taken[$slug] = true;
                DB::table('brands')->where('id', $brand->id)->update(['slug' => $slug]);
            });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
