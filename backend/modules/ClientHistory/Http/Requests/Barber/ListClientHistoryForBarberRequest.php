<?php

declare(strict_types=1);

namespace Modules\ClientHistory\Http\Requests\Barber;

use Modules\Barber\Models\BarberModel;
use Modules\ClientHistory\CQRS\Query\ListClientServiceHistoryQuery;
use Modules\ClientHistory\Eloquent\Resolvers\BarberClientRelationshipEloquentResolver;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListClientHistoryForBarberRequest extends BaseApiFormRequest
{
    public function authorize(): bool
    {
        $barber = $this->user('barber');

        return $barber instanceof BarberModel
            && app(BarberClientRelationshipEloquentResolver::class)->qualifies((string) $barber->id, (string) $this->route('client'));
    }

    public function rules(): array
    {
        return [
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'catalog_item_id' => ['nullable', 'uuid', 'exists:service_catalog_items,id'],
        ];
    }

    public function toQuery(): ListClientServiceHistoryQuery
    {
        return new ListClientServiceHistoryQuery(
            clientId: (string) $this->route('client'),
            perPage: (int) $this->validated('per_page', 15),
            catalogItemId: $this->validated('catalog_item_id'),
        );
    }
}
