<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Core\Constants\SlugConstants;
use Modules\Core\Support\UniqueSlug;

return new class extends Migration
{
    /** A public, unique slug for the `/branches/{slug}` web page; existing rows are backfilled from `name.en`. */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->string('slug', SlugConstants::CORE_SLUG_COLUMN_LENGTH)->nullable()->unique()->after('id');
        });

        $taken = [];

        DB::table('branches')->orderBy('created_at')->orderBy('id')->each(function (object $row) use (&$taken): void {
            $names = json_decode((string) $row->name, true);
            $name = is_array($names) ? (string) ($names['en'] ?? reset($names) ?: '') : (string) $row->name;
            $slug = UniqueSlug::make($name, 'branch', fn (string $candidate): bool => isset($taken[$candidate]));
            $taken[$slug] = true;

            DB::table('branches')->where('id', $row->id)->update(['slug' => $slug]);
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
