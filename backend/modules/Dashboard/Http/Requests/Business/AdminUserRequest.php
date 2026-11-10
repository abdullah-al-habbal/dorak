<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Invite (POST) and edit (PUT) share the same fields; the email must stay unique among admins. */
final class AdminUserRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $unique = Rule::unique('admins', 'email');
        $admin = $this->route('admin');
        if (is_string($admin)) {
            $unique->ignore($admin);
        }

        return [
            'name' => ['required', 'array:en,ar'],
            'name.en' => ['required', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'name.ar' => ['required', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'email' => ['required', 'email', 'max:255', $unique],
        ];
    }

    /** @return array{en: string, ar: string} */
    public function names(): array
    {
        return ['en' => (string) $this->validated('name.en'), 'ar' => (string) $this->validated('name.ar')];
    }

    public function email(): string
    {
        return mb_strtolower(trim((string) $this->validated('email')));
    }
}
