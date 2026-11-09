{{-- Self-contained on purpose: no Vite, database or session, so it still renders while the app is failing. --}}
@php
    $locale = request()->getPreferredLanguage(['ar', 'en']) ?? 'ar';
    $copy = trans("website::errors.{$status}", [], $locale);
    $home = trans('website::errors.home', [], $locale);
@endphp
<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>{{ $copy['title'] }} — Dorak</title>
    <style>
        :root { color-scheme: light dark; }
        body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 1.5rem; font-family: system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; background: #f4f6fa; color: #0f172a; }
        main { max-width: 28rem; }
        .code { margin: 0; font-size: 4rem; font-weight: 700; color: #2563eb; }
        h1 { margin: .25rem 0 .5rem; font-size: 1.5rem; }
        p { margin: 0 0 1.25rem; color: #475569; line-height: 1.6; }
        a { display: inline-block; padding: .6rem 1.1rem; border-radius: .5rem; background: #2563eb; color: #fff; text-decoration: none; }
        a:hover { background: #1d4ed8; }
        a:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 3px; }
        @media (prefers-color-scheme: dark) { body { background: #0d1220; color: #f1f5f9; } p { color: #94a3b8; } }
    </style>
</head>
<body>
    <main role="main">
        <p class="code">{{ $status }}</p>
        <h1>{{ $copy['title'] }}</h1>
        <p>{{ $copy['body'] }}</p>
        <a href="{{ url('/') }}">{{ $home }}</a>
    </main>
</body>
</html>
