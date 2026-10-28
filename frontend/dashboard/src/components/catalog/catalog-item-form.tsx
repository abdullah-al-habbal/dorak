"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDictionary } from "@/hooks/use-dictionary";
import { ApiClientError } from "@/services/api/core/client-error";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import {
  CATALOG_QUERY_KEYS,
  FACE_SHAPES,
  HAIR_TEXTURES,
} from "@/services/api/dashboard/catalog/catalog.constant";
import {
  catalogCategoriesQueryKey,
  catalogTagsQueryKey,
  createCatalogItem,
  getCatalogCategories,
  getCatalogTags,
  updateCatalogItem,
} from "@/services/api/dashboard/catalog/catalog.query";
import { catalogItemFormSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";
import type { ICatalogItem } from "@/services/api/dashboard/catalog/types/icatalog-item.types";
import type { ICatalogItemForm } from "@/services/api/dashboard/catalog/types/icatalog-item-form.types";
import type { ICatalogItemFormInput } from "@/services/api/dashboard/catalog/types/icatalog-item-form-input.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CATALOG_SERVER_FIELD_MAP } from "@/services/api/dashboard/catalog/catalog.constant";

interface ICatalogItemFormProps {
  /** When set, the form edits this item instead of creating one. */
  item?: ICatalogItem;
  onDone: () => void;
}

function defaultsFor(item?: ICatalogItem): ICatalogItemFormInput {
  return {
    categoryId: item?.categoryId ?? "",
    nameEn: item?.name.en ?? "",
    nameAr: item?.name.ar ?? "",
    slug: item?.slug ?? "",
    descriptionEn: item?.description.en ?? "",
    descriptionAr: item?.description.ar ?? "",
    isActive: item?.isActive ?? true,
    durationMinutes: item?.durationMinutes ?? "",
    faceShapes: item?.faceShapes ?? [],
    hairTextures: item?.hairTextures ?? [],
    tagIds: item?.tagIds ?? [],
  };
}

export function CatalogItemForm({ item, onDone }: ICatalogItemFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.catalog;
  const queryClient = useQueryClient();
  const categories = useQuery({
    queryKey: catalogCategoriesQueryKey,
    queryFn: getCatalogCategories,
  });
  const tags = useQuery({
    queryKey: catalogTagsQueryKey,
    queryFn: getCatalogTags,
  });
  const form = useForm<ICatalogItemFormInput, unknown, ICatalogItemForm>({
    resolver: zodResolver(catalogItemFormSchema),
    defaultValues: defaultsFor(item),
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (value: ICatalogItemForm) =>
      item ? updateCatalogItem(item.id, value) : createCatalogItem(value),
    onSuccess: async () => {
      notifySuccess(item ? copy.saved : copy.created);
      // The service form's catalog dropdown reads the lookup cache.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.items }),
        queryClient.invalidateQueries({
          queryKey: CATALOG_QUERY_KEYS.lookups,
        }),
      ]);
      form.reset(defaultsFor());
      onDone();
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 422) {
        Object.entries(error.errors ?? {}).forEach(([key, messages]) => {
          const field = CATALOG_SERVER_FIELD_MAP[key];
          if (field)
            form.setError(field, { type: "server", message: messages[0] });
        });
        return;
      }
      notifyApiError(error, dictionary);
    },
  });

  const serverError = (name: keyof ICatalogItemFormInput) =>
    errors[name]?.type === "server" ? (
      <span className="text-input-error-focus-border" role="alert">
        {errors[name]?.message}
      </span>
    ) : null;
  const text = (
    name: "nameEn" | "nameAr" | "slug" | "durationMinutes",
    label: string,
  ) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <Input
        state={errors[name] ? "error" : "default"}
        {...form.register(name)}
      />
      {serverError(name)}
    </label>
  );
  const area = (name: "descriptionEn" | "descriptionAr", label: string) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <TextArea {...form.register(name)} />
      {serverError(name)}
    </label>
  );
  const checks = (
    name: "faceShapes" | "hairTextures",
    legend: string,
    options: ReadonlyArray<{ value: string; label: string }>,
  ) => (
    <fieldset className="grid gap-2 text-sm text-text-100">
      <legend>{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-1">
            <input
              type="checkbox"
              value={option.value}
              {...form.register(name)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      <label className="grid gap-1 text-sm text-text-100 sm:col-span-2">
        <span>{copy.category}</span>
        <select
          className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
          {...form.register("categoryId")}
        >
          <option value="">{copy.selectCategory}</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name.en || category.name.ar}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <span className="text-input-error-focus-border" role="alert">
            {errors.categoryId.type === "server"
              ? errors.categoryId.message
              : copy.categoryRequired}
          </span>
        ) : null}
      </label>
      {text("nameEn", copy.nameEn)}
      {text("nameAr", copy.nameAr)}
      {text("slug", copy.slug)}
      {text("durationMinutes", copy.duration)}
      {area("descriptionEn", copy.descriptionEn)}
      {area("descriptionAr", copy.descriptionAr)}
      {checks(
        "faceShapes",
        copy.faceShapes,
        FACE_SHAPES.map((value) => ({
          value,
          label: copy.faceShapeLabels[value],
        })),
      )}
      {checks(
        "hairTextures",
        copy.hairTextures,
        HAIR_TEXTURES.map((value) => ({
          value,
          label: copy.hairTextureLabels[value],
        })),
      )}
      {tags.data && tags.data.length > 0 ? (
        <fieldset className="grid gap-2 text-sm text-text-100 sm:col-span-2">
          <legend>{copy.tags}</legend>
          <div className="flex flex-wrap gap-3">
            {tags.data.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={tag.id}
                  {...form.register("tagIds")}
                />
                {tag.name.en || tag.name.ar}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <label className="flex items-center gap-2 text-sm text-text-100">
        <input type="checkbox" {...form.register("isActive")} />
        {copy.active}
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {item ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
