<?php

declare(strict_types=1);

namespace Modules\Currency\Services;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Modules\Client\Models\ClientModel;
use Modules\Currency\CQRS\Query\Shared\ConvertCurrencyQuery;
use Modules\Currency\Eloquent\Resolvers\Shared\ConvertCurrencyEloquentResolver;
use Modules\Currency\ValuesObjects\DisplayPriceResult;
use Modules\Preference\Models\PreferenceModel;

final readonly class PriceConverter
{
    public const DISPLAY_CURRENCY_HEADER = 'X-Display-Currency';

    public function __construct(
        private ConvertCurrencyEloquentResolver $resolver,
    ) {}

    public function displayPriceFor(
        Request $request,
        float $basePrice,
        string $baseCurrencyCode,
        string $ownerType,
        string $ownerId,
    ): ?DisplayPriceResult {
        $displayCurrencyCode = $this->viewerCurrencyCode($request);

        if ($displayCurrencyCode === null || $displayCurrencyCode === $baseCurrencyCode) {
            return null;
        }

        $converted = $this->convert($basePrice, $baseCurrencyCode, $displayCurrencyCode);
        $dualDisplay = $this->dualDisplayFor($ownerType, $ownerId);

        return new DisplayPriceResult(
            amount: $converted,
            currencyCode: $displayCurrencyCode,
            conversionUnavailable: $converted === null,
            dualPriceDisplay: $dualDisplay,
        );
    }

    private function viewerCurrencyCode(Request $request): ?string
    {
        $client = $request->user('client');

        if ($client instanceof ClientModel) {
            $preference = PreferenceModel::query()
                ->where('preferenceable_type', 'client')
                ->where('preferenceable_id', $client->getKey())
                ->with('displayCurrency')
                ->first();

            return $preference?->displayCurrency?->code;
        }

        $header = $request->header(self::DISPLAY_CURRENCY_HEADER);

        return is_string($header) && $header !== '' ? strtoupper($header) : null;
    }

    private function dualDisplayFor(string $ownerType, string $ownerId): bool
    {
        return (bool) PreferenceModel::query()
            ->where('preferenceable_type', $ownerType)
            ->where('preferenceable_id', $ownerId)
            ->value('dual_price_display');
    }

    private function convert(float $amount, string $fromCode, string $toCode): ?float
    {
        try {
            $result = $this->resolver->resolve(new ConvertCurrencyQuery($fromCode, $toCode, $amount));
        } catch (ModelNotFoundException) {
            return null;
        }

        return $result?->result;
    }
}
