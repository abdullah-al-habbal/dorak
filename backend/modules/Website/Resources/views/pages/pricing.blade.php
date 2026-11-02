<x-website::layouts.app :page="$page" :locale="$locale">
    @php
        $sections = $page['sections'] ?? [];
        $heroSection = collect($sections)->firstWhere('section_type', 'hero');
        $pricingSection = collect($sections)->firstWhere('section_type', 'pricing');
        $ctaSection = collect($sections)->firstWhere('section_type', 'cta');
    @endphp

    <x-website::hero :content="$heroSection['content'] ?? null" />
    <x-website::pricing :content="$pricingSection['content'] ?? null" />
    <x-website::cta :content="$ctaSection['content'] ?? null" />
</x-website::layouts.app>
