"use client";

import { BrandForm } from "@/components/brands/brand-form";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import {
  brandsQueryKey,
  getBrands,
} from "@/services/api/dashboard/brands/brands.query";
import type { IBrand } from "@/services/api/dashboard/brands/types/ibrands.types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";

export function BrandsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.brands;
  const session = useSession();
  // A brand belongs to a client account, so only an owner can start a new one.
  const canCreate = session.actor === "owner";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IBrand | null>(null);
  const list = useQuery({
    queryKey: brandsQueryKey(search, page),
    queryFn: () => getBrands(search, page),
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
      {canCreate || editing ? (
        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-title-50">
              {editing ? copy.editTitle : copy.create}
            </h2>
            <BrandForm
              key={editing?.id ?? "new"}
              brand={editing ?? undefined}
              onDone={() => setEditing(null)}
            />
          </CardContent>
        </Card>
      ) : null}
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
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((brand) => (
          <li key={brand.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
                <div>
                  <strong>{brand.name.en || brand.name.ar}</strong>
                  <p className="text-text-secondary">
                    {brand.baseCurrencyCode ?? "—"} · {brand.branchesCount}{" "}
                    {copy.branches}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{copy.universes[brand.universe]}</Badge>
                  <Button
                    size="sm"
                    appearance="outline"
                    onPress={() => setEditing(brand)}
                  >
                    {copy.edit}
                  </Button>
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
