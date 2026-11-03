<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\ClientInteraction\CQRS\Command\AddFavoriteCommand;
use Modules\ClientInteraction\Enums\FavoritedTypeEnum;
use Modules\ClientInteraction\Rules\FavoritedExists;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class AddFavoriteRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'favorited_id' => ['required', 'string', ValidationLimitConstants::RULE_ID_MAX, new FavoritedExists($this->input('favorited_type'))],
            'favorited_type' => ['required', Rule::enum(FavoritedTypeEnum::class)],
        ];
    }

    public function toCommand(): AddFavoriteCommand
    {
        return new AddFavoriteCommand(
            clientId: (string) $this->user()->id,
            favoritedId: $this->validated('favorited_id'),
            favoritedType: FavoritedTypeEnum::from($this->validated('favorited_type')),
        );
    }
}
