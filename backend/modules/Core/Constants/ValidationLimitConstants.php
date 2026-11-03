<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

/**
 * Shared upper bounds for Form Request rules, so no input reaches the database
 * unbounded. `RULE_*` constants are ready to drop into a rules array.
 * Passwords have a maximum only: legacy accounts may hold short passwords.
 */
final class ValidationLimitConstants
{
    public const int VALIDATION_NAME_MAX = 100;

    public const int VALIDATION_TITLE_MAX = 150;

    public const int VALIDATION_DESCRIPTION_MAX = 2000;

    public const int VALIDATION_SHORT_TEXT_MAX = 255;

    public const int VALIDATION_PASSWORD_MAX = 255;

    public const int VALIDATION_ID_MAX = 36;

    public const int VALIDATION_TOKEN_MAX = 2048;

    public const int VALIDATION_LIST_MAX = 50;

    public const int VALIDATION_LAYOUT_POSITION_MAX = 10000;

    public const int VALIDATION_LAYOUT_SIZE_MIN = 1;

    public const int VALIDATION_LAYOUT_ROTATION_LIMIT = 360;

    public const int VALIDATION_RADIUS_KM_MAX = 20000;

    public const int VALIDATION_PRICE_MINOR_MAX = 100000000;

    public const string RULE_NAME_MAX = 'max:'.self::VALIDATION_NAME_MAX;

    public const string RULE_TITLE_MAX = 'max:'.self::VALIDATION_TITLE_MAX;

    public const string RULE_DESCRIPTION_MAX = 'max:'.self::VALIDATION_DESCRIPTION_MAX;

    public const string RULE_SHORT_TEXT_MAX = 'max:'.self::VALIDATION_SHORT_TEXT_MAX;

    public const string RULE_PASSWORD_MAX = 'max:'.self::VALIDATION_PASSWORD_MAX;

    public const string RULE_ID_MAX = 'max:'.self::VALIDATION_ID_MAX;

    public const string RULE_TOKEN_MAX = 'max:'.self::VALIDATION_TOKEN_MAX;

    public const string RULE_LIST_MAX = 'max:'.self::VALIDATION_LIST_MAX;

    public const string RULE_LAYOUT_POSITION = 'between:0,'.self::VALIDATION_LAYOUT_POSITION_MAX;

    public const string RULE_LAYOUT_SIZE = 'between:'.self::VALIDATION_LAYOUT_SIZE_MIN.','.self::VALIDATION_LAYOUT_POSITION_MAX;

    public const string RULE_LAYOUT_ROTATION = 'between:-'.self::VALIDATION_LAYOUT_ROTATION_LIMIT.','.self::VALIDATION_LAYOUT_ROTATION_LIMIT;

    public const string RULE_RADIUS_KM = 'between:0,'.self::VALIDATION_RADIUS_KM_MAX;

    public const string RULE_PRICE_MINOR = 'between:0,'.self::VALIDATION_PRICE_MINOR_MAX;
}
