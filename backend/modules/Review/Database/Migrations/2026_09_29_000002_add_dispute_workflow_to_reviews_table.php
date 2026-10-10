<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->string('status')->default('published')->after('comment')->index();
            $table->text('dispute_reason')->nullable()->after('status');
            $table->timestamp('disputed_at')->nullable()->after('dispute_reason');
            $table->timestamp('resolved_at')->nullable()->after('disputed_at');
            $table->foreignUuid('resolved_by')->nullable()->constrained('admins')->nullOnDelete()->after('resolved_at');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropConstrainedForeignId('resolved_by');
            $table->dropColumn(['status', 'dispute_reason', 'disputed_at', 'resolved_at']);
        });
    }
};
