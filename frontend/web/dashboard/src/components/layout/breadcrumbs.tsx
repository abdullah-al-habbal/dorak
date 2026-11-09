"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV_ITEMS } from "@/config/nav.constant";
import { ACCOUNT_SEGMENT, portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useDictionary } from "@/hooks/use-dictionary";

export function Breadcrumbs({ actor }: { actor: AuthActor }) {
  const { shell, auth } = useDictionary();
  const pathname = usePathname();
  const root = portalRoot(actor);
  const segments = pathname.slice(root.length).split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const item = NAV_ITEMS[actor].find((entry) => entry.segment === segment);
    const label = item ? shell.nav[item.key] : segment === ACCOUNT_SEGMENT ? shell.profile.account : segment;
    return { label, href: `${root}/${segments.slice(0, index + 1).join("/")}` };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage>{auth.actors[actor].name}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href={root} />}>{auth.actors[actor].name}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator className="rtl:rotate-180" />
            <BreadcrumbItem>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
