<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests;

use Illuminate\Contracts\Translation\Translator;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Modules\Core\Constants\CoreTranslationConstants;
use Modules\Core\Helpers\ApiResponseTrait;

abstract class BaseApiFormRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Readable names for translatable fields (`name.en` reads "English name"); the error keys stay unchanged.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        // An array, so not through TranslatorHandlerService (string only); a missing locale falls back to English.
        $attributes = app(Translator::class)->get(CoreTranslationConstants::VALIDATION_ATTRIBUTES_KEY);

        return is_array($attributes) ? $attributes : [];
    }

    protected function failedValidation(Validator $validator): never
    {
        $response = $this->unprocessable(
            errors: $validator->errors()
        );

        throw new HttpResponseException($response);
    }

    protected function failedAuthorization(): never
    {
        $response = $this->forbidden();

        throw new HttpResponseException($response);
    }
}
