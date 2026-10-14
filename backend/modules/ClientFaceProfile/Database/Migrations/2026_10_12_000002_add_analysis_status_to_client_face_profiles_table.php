<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->string('analysis_status')->default('pending')->after('is_primary');
        });
    }

    public function down(): void
    {
        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->dropColumn('analysis_status');
        });
    }
};
