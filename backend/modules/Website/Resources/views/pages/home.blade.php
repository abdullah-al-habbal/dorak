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

    <x-website::hero :content="$heroSection['body'] ?? null" />
    <x-website::features :content="$featureSection['body'] ?? null" />
    <x-website::testimonials :content="$testimonialSection['body'] ?? null" :testimonials="$testimonialSection['testimonials'] ?? []" />
    <x-website::floor-plan-demo :content="$floorPlanSection['body'] ?? null" />
    <x-website::pricing :content="$pricingSection['body'] ?? null" />
    <x-website::cta :content="$ctaSection['body'] ?? null" />
</x-website::layouts.app>
