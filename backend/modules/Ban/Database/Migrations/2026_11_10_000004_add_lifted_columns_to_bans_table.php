<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bans', function (Blueprint $table) {
            $table->timestamp('lifted_at')->nullable()->after('expires_at');
            $table->foreignUuid('lifted_by_id')->nullable()->after('lifted_at')->constrained('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bans', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lifted_by_id');
            $table->dropColumn('lifted_at');
        });
    }
};
