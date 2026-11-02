<?php

declare(strict_types=1);

namespace Modules\Settings\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * An admin-editable integer override for a platform limit. A missing row means
 * the SettingKey default applies.
 *
 * @property string $id
 * @property string $setting_key
 * @property int $value_integer
 */
#[Fillable(['setting_key', 'value_integer'])]
#[Table('platform_settings')]
class PlatformSettingModel extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['value_integer' => 'integer'];
    }
}
