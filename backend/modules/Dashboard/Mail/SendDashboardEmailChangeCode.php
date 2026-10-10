<?php

declare(strict_types=1);

namespace Modules\Dashboard\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class SendDashboardEmailChangeCode extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly string $code) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Confirm your Dorak email address');
    }

    public function content(): Content
    {
        return new Content(htmlString: "<p>Your email-change confirmation code: <strong>{$this->code}</strong></p><p>This code expires in 10 minutes.</p>");
    }
}
