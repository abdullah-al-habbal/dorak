<?php

declare(strict_types=1);

namespace Modules\Dashboard\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Backoff([60, 300, 900])]
#[Tries(4)]
final class OwnerBrandSubmitted extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $url,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: __('dashboard::email.owner_brand_submitted_subject'));
    }

    public function content(): Content
    {
        return new Content(htmlString: __('dashboard::email.owner_brand_submitted_body', [
            'name' => e($this->name),
            'url' => e($this->url),
        ]));
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Owner brand submission email exhausted its queue retries.', [
            'mailable' => self::class,
            'exception' => $exception::class,
        ]);
    }
}
