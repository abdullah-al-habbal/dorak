<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** A tag is shown to visitors, so it becomes `{en, ar}` like every other label; a stored plain string keeps its text under both languages. */
    public function up(): void
    {
        $this->rewrite(fn (mixed $tag): mixed => is_string($tag) ? ['en' => $tag, 'ar' => $tag] : $tag);
    }

    public function down(): void
    {
        $this->rewrite(fn (mixed $tag): mixed => is_array($tag) ? (string) ($tag['en'] ?? $tag['ar'] ?? '') : $tag);
    }

    /** @param callable(mixed): mixed $map */
    private function rewrite(callable $map): void
    {
        DB::table('branches')->whereNotNull('tags')->orderBy('id')->each(function (object $row) use ($map): void {
            $tags = json_decode((string) $row->tags, true);

            if (! is_array($tags)) {
                return;
            }

            DB::table('branches')->where('id', $row->id)->update([
                'tags' => json_encode(array_values(array_map($map, $tags)), JSON_UNESCAPED_UNICODE),
            ]);
        });
    }
};
