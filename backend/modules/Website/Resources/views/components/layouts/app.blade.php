{{-- root/modules/Website/Resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" data-theme="neutral">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @php
        $pageTitle = isset($page['page']['title']) ? $page['page']['title'] . ' — ' . __('website::brand.name') : __('website::meta.default_title');
    @endphp

    @isset($page['page']['meta_description'])
        <meta name="description" content="{{ $page['page']['meta_description'] }}">
        <meta property="og:description" content="{{ $page['page']['meta_description'] }}">
    @endisset

    <title>{{ $pageTitle }}</title>

    @isset($seo)
        <link rel="canonical" href="{{ $seo->canonical }}">
        @foreach ($seo->alternates as $hreflang => $alternateUrl)
            <link rel="alternate" hreflang="{{ $hreflang }}" href="{{ $alternateUrl }}">
        @endforeach
        <link rel="alternate" hreflang="x-default" href="{{ $seo->defaultUrl }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ __('website::brand.name') }}">
        <meta property="og:title" content="{{ $pageTitle }}">
        <meta property="og:url" content="{{ $seo->canonical }}">
        <meta property="og:locale" content="{{ $locale === 'ar' ? 'ar_AR' : 'en_US' }}">
    @endisset

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-white text-slate-900 antialiased" x-data="websiteStore()">
    <div class="flex min-h-screen flex-col">
        <x-website::navbar />

        <main class="flex-1">
            {{ $slot }}
        </main>

        <x-website::footer />
    </div>
</body>
</html>
