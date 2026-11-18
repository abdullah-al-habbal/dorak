@props(['content' => null, 'title' => ''])

<article class="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <h1 class="text-3xl font-bold tracking-tight text-slate-900">{{ $content['heading'] ?? $title }}</h1>
    <div class="mt-8 space-y-5 text-base leading-7 text-slate-700">
        @foreach (($content['paragraphs'] ?? []) as $paragraph)
            <p>{{ $paragraph }}</p>
        @endforeach
    </div>
</article>
