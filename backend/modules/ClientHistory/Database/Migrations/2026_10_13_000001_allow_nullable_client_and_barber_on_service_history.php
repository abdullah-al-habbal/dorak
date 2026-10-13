<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Database\Migrations;

// @contract-migration: booking history now permits unassigned barbers and anonymized clients for Task 13.
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_service_histories', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['barber_id']);
            $table->foreignUuid('client_id')->nullable()->change();
            $table->foreignUuid('barber_id')->nullable()->change();
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
            $table->foreign('barber_id')->references('id')->on('barbers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (DB::table('client_service_histories')->whereNull('client_id')->orWhereNull('barber_id')->exists()) {
            throw new RuntimeException('Cannot restore non-null history ownership while nullable history rows exist.');
        }

        Schema::table('client_service_histories', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['barber_id']);
            $table->foreignUuid('client_id')->nullable(false)->change();
            $table->foreignUuid('barber_id')->nullable(false)->change();
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->foreign('barber_id')->references('id')->on('barbers')->cascadeOnDelete();
        });
    }
};
