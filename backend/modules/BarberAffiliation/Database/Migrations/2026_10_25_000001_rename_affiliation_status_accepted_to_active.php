<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('barber_affiliations')->where('status', 'accepted')->update(['status' => 'active']);
    }

    public function down(): void
    {
        DB::table('barber_affiliations')->where('status', 'active')->update(['status' => 'accepted']);
    }
};
