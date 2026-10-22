<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Barber\Models\BarberModel;

return new class extends Migration
{
    /**
     * Stored rating aggregate of published/resolved reviews (Task 42),
     * maintained by the Review module and backfilled here.
     */
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->decimal('rating_avg', 3, 2)->nullable()->index();
            $table->unsignedInteger('rating_count')->default(0);
        });

        $subjectTypes = ['barber', BarberModel::class];
        $reviews = fn () => DB::table('reviews')
            ->whereColumn('reviews.subject_id', 'barbers.id')
            ->whereIn('reviews.subject_type', $subjectTypes)
            ->whereIn('reviews.status', ['published', 'resolved']);

        DB::table('barbers')->update([
            'rating_count' => DB::raw('('.$reviews()->selectRaw('count(*)')->toRawSql().')'),
            'rating_avg' => DB::raw('('.$reviews()->selectRaw('round(avg(reviews.rating), 2)')->toRawSql().')'),
        ]);
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->dropIndex(['rating_avg']);
            $table->dropColumn(['rating_avg', 'rating_count']);
        });
    }
};
