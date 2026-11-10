<?php

declare(strict_types=1);

namespace Modules\Dashboard\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class OwnerBrandSuspended extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $name,
        public readonly string $reason,
        public readonly string $url,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: __('dashboard::email.owner_brand_suspended_subject'));
    }

    public function content(): Content
    {
        return new Content(htmlString: __('dashboard::email.owner_brand_suspended_body', [
            'name' => e($this->name),
            'reason' => e($this->reason),
            'url' => e($this->url),
        ]));
    }
}
