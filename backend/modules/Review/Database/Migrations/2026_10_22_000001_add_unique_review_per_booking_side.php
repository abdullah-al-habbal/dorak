<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One review per booking, author side and subject side: the client may
     * review the branch and the barber (Task 39), and the provider side may
     * review the client once (Task 40).
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table): void {
            $table->unique(['booking_id', 'author_type', 'subject_type'], 'reviews_booking_author_subject_unique');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table): void {
            $table->dropUnique('reviews_booking_author_subject_unique');
        });
    }
};
