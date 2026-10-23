<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** The clientele a barber serves (Task 44); everyone until they say otherwise. */
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->string('universe', 16)->default('unisex')->index();
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->dropIndex(['universe']);
            $table->dropColumn('universe');
        });
    }
};
