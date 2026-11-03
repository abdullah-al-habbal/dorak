<?php

declare(strict_types=1);

use Modules\Core\Contracts\SmsSender;
use Modules\Core\Services\Sms\SmsSenderFactory;

arch('SMS drivers are final strategies that implement the contract')
    ->expect('Modules\Core\Services\Sms')
    ->classes()
    ->toBeFinal()
    ->ignoring(SmsSenderFactory::class)
    ->toImplement(SmsSender::class)
    ->ignoring(SmsSenderFactory::class);

arch('only Core Services Sms may implement the SmsSender contract')
    ->expect('Modules')
    ->not->toImplement(SmsSender::class)
    ->ignoring(['Modules\Core\Services\Sms', SmsSender::class]);

arch('SMS drivers are only instantiated by the factory')
    ->expect('Modules\Core\Services\Sms\LogSmsSender')
    ->toOnlyBeUsedIn(SmsSenderFactory::class)
    ->and('Modules\Core\Services\Sms\GenericHttpSmsSender')
    ->toOnlyBeUsedIn(SmsSenderFactory::class);

arch('feature code depends on the SmsSender contract, never on a concrete driver or the Http facade for SMS')
    ->expect(['Modules\Client', 'Modules\Barber', 'Modules\Branch', 'Modules\Booking'])
    ->not->toUse(['Modules\Core\Services\Sms']);

arch('SMS delivery failures use the dedicated exception')
    ->expect('Modules\Core\Exceptions\SmsDeliveryException')
    ->toExtend(RuntimeException::class)
    ->toBeFinal();
