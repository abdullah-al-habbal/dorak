@props([])

@php($locale = app()->getLocale())

<footer class="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
        <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p class="text-sm text-slate-500">
                &copy; {{ date('Y') }} {{ __('website::brand.name') }}. {{ __('website::footer.rights') }}
            </p>
            <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="{{ __('website::footer.legal_nav') }}">
                @foreach (['features', 'pricing', 'about', 'contact', 'privacy', 'terms', 'delete-account'] as $link)
                    <a href="/{{ $locale }}/{{ $link }}" class="text-xs text-slate-500 transition hover:text-accent">
                        {{ __('website::footer.'.str_replace('-', '_', $link)) }}
                    </a>
                @endforeach
            </nav>
        </div>
    </div>
</footer>
