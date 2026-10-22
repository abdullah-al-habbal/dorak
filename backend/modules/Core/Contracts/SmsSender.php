<?php

declare(strict_types=1);

namespace Modules\Core\Contracts;

interface SmsSender
{
    public function send(string $phone, string $message): void;
}
