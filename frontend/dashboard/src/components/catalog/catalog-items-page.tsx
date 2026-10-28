"use client";

import { CatalogItemForm } from "@/components/catalog/catalog-item-form";
import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { notifySuccess } from "@/services/api/core/notifications";
import { CATALOG_QUERY_KEYS } from "@/services/api/dashboard/catalog/catalog.constant";
import {
  catalogItemsQueryKey,
  deleteCatalogItem,
  getCatalogItems,
} from "@/services/api/dashboard/catalog/catalog.query";
import type { ICatalogItem } from "@/services/api/dashboard/catalog/types/icatalog-item.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";

export function CatalogItemsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.catalog;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ICatalogItem | null>(null);
  const list = useQuery({
    queryKey: catalogItemsQueryKey(search, page),
    queryFn: () => getCatalogItems(search, page),
  });
  const remove = useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: async () => {
      notifySuccess(copy.deleted);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.items }),
        queryClient.invalidateQueries({
          queryKey: CATALOG_QUERY_KEYS.lookups,
        }),
      ]);
    },
  });

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("search");
    setSearch(typeof value === "string" ? value.trim() : "");
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-title-50">
            {editing ? copy.editTitle : copy.create}
          </h2>
          <CatalogItemForm
            key={editing?.id ?? "new"}
            item={editing ?? undefined}
            onDone={() => setEditing(null)}
          />
        </CardContent>
      </Card>
      <form className="flex max-w-md items-end gap-2" onSubmit={submitSearch}>
        <label className="grid flex-1 gap-1 text-sm text-text-100">
          <span>{copy.search}</span>
          <Input name="search" defaultValue={search} />
        </label>
        <Button type="submit">{copy.searchAction}</Button>
      </form>
      {list.isPending ? (
        <p className="text-text-secondary">{dictionary.people.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {remove.isError ? (
        <p role="alert">{apiErrorMessage(remove.error, dictionary)}</p>
      ) : null}
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((item) => (
          <li key={item.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{item.name.en || item.name.ar}</strong>
                  <p className="text-text-secondary">{item.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{item.isActive ? copy.active : copy.inactive}</Badge>
                  <Button
                    size="sm"
                    appearance="outline"
                    onPress={() => setEditing(item)}
                  >
                    {copy.edit}
                  </Button>
                  <ConfirmActionButton
                    danger
                    label={copy.delete}
                    title={copy.deleteTitle}
                    body={copy.deleteBody}
                    isPending={remove.isPending}
                    onConfirm={() => remove.mutate(item.id)}
                  />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {list.data ? (
        <Pagination
          currentPage={list.data.pagination.currentPage}
          totalPages={list.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}
