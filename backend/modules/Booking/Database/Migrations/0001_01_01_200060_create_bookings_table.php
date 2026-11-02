<?php

// modules/Booking/Database/Migrations/0001_01_01_000001_create_bookings_table.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('chair_id')->nullable()->constrained('chairs')->nullOnDelete();
            $table->foreignUuid('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignUuid('barber_id')->nullable()->constrained('barbers')->nullOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('booking_status');
            $table->string('cancellation_reason', 500)->nullable();
            $table->string('payment_method')->default(BookingPaymentMethod::PayAtSalon->value);
            $table->string('payment_status')->default(BookingPaymentStatus::UnpaidInPerson->value);
            $table->json('home_address')->nullable();
            $table->timestamps();

            $table->index(['chair_id', 'starts_at', 'ends_at', 'booking_status']);
            $table->index(['barber_id', 'starts_at', 'ends_at', 'booking_status']);
            $table->index(['branch_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
