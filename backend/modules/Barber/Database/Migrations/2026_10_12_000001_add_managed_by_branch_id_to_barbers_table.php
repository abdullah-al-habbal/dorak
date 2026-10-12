<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->foreignUuid('managed_by_branch_id')
                ->nullable()
                ->after('client_id')
                ->constrained('branches')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('managed_by_branch_id');
        });
    }
};
