<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Booking\Constants\BookingConstants;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_idempotency_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('key', BookingConstants::BOOKING_IDEMPOTENCY_KEY_MAX_LENGTH);
            $table->char('request_hash', 64);
            $table->dateTime('expires_at');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['client_id', 'key']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_idempotency_keys');
    }
};
