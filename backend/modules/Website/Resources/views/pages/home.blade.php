{{-- backend/modules/Website/Resources/views/pages/home.blade.php --}}
<x-website::layouts.app :page="$page" :locale="$locale">
    @php
        $sections = $page['sections'] ?? [];
        $heroSection = collect($sections)->firstWhere('section_type', 'hero');
        $featureSection = collect($sections)->firstWhere('section_type', 'feature_list');
        $testimonialSection = collect($sections)->firstWhere('section_type', 'testimonials');
        $floorPlanSection = collect($sections)->firstWhere('section_type', 'floor_plan_demo');
        $pricingSection = collect($sections)->firstWhere('section_type', 'pricing');
        $ctaSection = collect($sections)->firstWhere('section_type', 'cta');
    @endphp

    <x-website::hero :content="$heroSection['content'] ?? null" />
    <x-website::features :content="$featureSection['content'] ?? null" />
    <x-website::testimonials :content="$testimonialSection['content'] ?? null" :testimonials="$testimonialSection['testimonials'] ?? []" />
    <x-website::floor-plan-demo :content="$floorPlanSection['content'] ?? null" />
    <x-website::pricing :content="$pricingSection['content'] ?? null" />
    <x-website::cta :content="$ctaSection['content'] ?? null" />
</x-website::layouts.app>
