<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;

final readonly class DashboardProfileData
{
    public function __construct(
        public ?string $displayName,
        public ?string $email,
        public ?string $phone,
        public ?string $pendingEmail = null,
    ) {}

    public static function fromModel(AdminModel|BranchModel|BarberModel $model, ?string $pendingEmail = null): self
    {
        $name = $model->getAttribute('name');
        $locale = (string) app()->getLocale();
        $displayName = is_array($name) ? ($name[$locale] ?? reset($name)) : $name;

        return new self(
            displayName: is_string($displayName) ? $displayName : null,
            email: is_string($model->getAttribute('email')) ? $model->getAttribute('email') : null,
            phone: is_string($model->getAttribute('phone')) ? $model->getAttribute('phone') : null,
            pendingEmail: $pendingEmail,
        );
    }

    /** @return array{display_name: ?string, email: ?string, phone: ?string, pending_email: ?string} */
    public function toArray(): array
    {
        return ['display_name' => $this->displayName, 'email' => $this->email, 'phone' => $this->phone, 'pending_email' => $this->pendingEmail];
    }
}
