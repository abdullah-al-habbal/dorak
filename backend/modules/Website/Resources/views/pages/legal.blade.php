<x-website::layouts.app :page="$page" :locale="$locale" :seo="$seo">
    @php
        $legal = collect($page['sections'] ?? [])->firstWhere('section_type', 'legal_text');
    @endphp

    <x-website::legal-text :content="$legal['body'] ?? null" :title="$page['page']['title'] ?? ''" />
</x-website::layouts.app>
