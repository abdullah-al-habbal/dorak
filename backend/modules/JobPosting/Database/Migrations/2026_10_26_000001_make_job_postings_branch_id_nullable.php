<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// @contract-migration: EC-20 (Task 56) — job_postings.branch_id becomes nullable/nullOnDelete
// so a deleted branch's postings (now closed by a BranchModel::deleting hook) and their
// applications survive the branch. Old code only ever writes a real branch_id; it never
// reads a null one until the next release ships the application-layer handling for it.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_postings', function (Blueprint $table): void {
            $table->dropForeign(['branch_id']);
        });

        Schema::table('job_postings', function (Blueprint $table): void {
            $table->uuid('branch_id')->nullable()->change();
            $table->foreign('branch_id')->references('id')->on('branches')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table): void {
            $table->dropForeign(['branch_id']);
        });

        Schema::table('job_postings', function (Blueprint $table): void {
            $table->uuid('branch_id')->nullable(false)->change();
            $table->foreign('branch_id')->references('id')->on('branches')->cascadeOnDelete();
        });
    }
};
