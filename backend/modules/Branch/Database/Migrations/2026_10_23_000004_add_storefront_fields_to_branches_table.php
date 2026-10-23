<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Branch storefront (Task 51): translatable description and address, and free-form tags. */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->json('description')->nullable();
            $table->json('address')->nullable();
            $table->json('tags')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn(['description', 'address', 'tags']);
        });
    }
};
