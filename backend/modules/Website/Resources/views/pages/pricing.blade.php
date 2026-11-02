<x-website::layouts.app :page="$page" :locale="$locale">
    @php
        $sections = $page['sections'] ?? [];
        $heroSection = collect($sections)->firstWhere('section_type', 'hero');
        $pricingSection = collect($sections)->firstWhere('section_type', 'pricing');
        $ctaSection = collect($sections)->firstWhere('section_type', 'cta');
    @endphp

    <x-website::hero :content="$heroSection['body'] ?? null" />
    <x-website::pricing :content="$pricingSection['body'] ?? null" />
    <x-website::cta :content="$ctaSection['body'] ?? null" />
</x-website::layouts.app>
