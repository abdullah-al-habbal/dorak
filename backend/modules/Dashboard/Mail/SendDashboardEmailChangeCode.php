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
        return new Envelope(subject: __('dashboard::email.email_change_subject'));
    }

    public function content(): Content
    {
        return new Content(htmlString: __('dashboard::email.email_change_body', ['code' => $this->code]));
    }
}
