{{-- root/modules/Website/Resources/views/pages/features.blade.php --}}
<x-website::layouts.app :page="$page" :locale="$locale">
    @php
        $sections = $page['sections'] ?? [];
        $heroSection = collect($sections)->firstWhere('section_type', 'hero');
        $featureSection = collect($sections)->firstWhere('section_type', 'feature_list');
    @endphp

    <x-website::hero :content="$heroSection['body'] ?? null" />
    <x-website::features :content="$featureSection['body'] ?? null" />
</x-website::layouts.app>
