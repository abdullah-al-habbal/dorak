<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        // @contract-migration: new application code writes image_path and leaves the legacy URL null.
        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });

        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('client_id');
        });

        DB::table('client_face_profiles')->orderBy('id')->each(function (object $profile): void {
            $urlPath = parse_url($profile->image_url ?? '', PHP_URL_PATH);
            $publicPath = (string) preg_replace('#^/storage/#', '', $urlPath ?: ($profile->image_url ?? ''));
            $privatePath = "face-profiles/{$profile->client_id}/".basename($publicPath);

            if (Storage::disk('public')->exists($publicPath)) {
                Storage::disk('local')->put($privatePath, Storage::disk('public')->get($publicPath));
                Storage::disk('public')->delete($publicPath);
            } elseif (! Storage::disk('local')->exists($privatePath)) {
                $privatePath = null;
            }

            DB::table('client_face_profiles')->where('id', $profile->id)->update([
                'image_path' => $privatePath,
            ]);
        });

        // @contract-migration: the legacy public URL column is no longer part of the photo contract.
        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->string('image_url')->nullable();
        });

        DB::table('client_face_profiles')->orderBy('id')->each(function (object $profile): void {
            $path = $profile->image_path;
            if ($path && Storage::disk('local')->exists($path)) {
                Storage::disk('public')->put($path, Storage::disk('local')->get($path));
                DB::table('client_face_profiles')->where('id', $profile->id)->update([
                    'image_url' => Storage::disk('public')->url($path),
                ]);
            }
        });

        Schema::table('client_face_profiles', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });
    }
};
