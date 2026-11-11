<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Http\Requests\Admin\SaveCatalogTagRequest;
use Modules\ServiceCatalog\Http\Resources\Admin\AdminCatalogTagResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

final class StoreCatalogTagAction extends BaseApiAction
{
    public function __invoke(SaveCatalogTagRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', ServiceCatalogItemTagModel::class);

        $input = $request->validated();
        $base = Str::slug($input['name']['en']) ?: 'tag';
        $slug = ServiceCatalogItemTagModel::withTrashed()->where('slug', $base)->exists() ? $base.'-'.Str::lower(Str::random(6)) : $base;

        $tag = ServiceCatalogItemTagModel::query()->create([...$input, 'slug' => $slug, 'is_active' => $input['is_active'] ?? true]);

        return $this->created(data: new AdminCatalogTagResource($tag), message: __('servicecatalog::messages.tag_saved'));
    }
}
