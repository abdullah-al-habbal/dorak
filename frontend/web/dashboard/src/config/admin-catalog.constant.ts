/** Mirrors `ServiceCatalogCategoryConstants` in the backend. */
export const CATALOG_CATEGORY_MAX_NAME = 120;
export const CATALOG_CATEGORY_MAX_DESCRIPTION = 1000;
export const CATALOG_CATEGORY_MAX_SORT_ORDER = 65535;
export const ADMIN_CATALOG_MAX_SEARCH = 120;

/** The detail dialog previews this many catalog items of a category (items are edited on the Items tab). */
export const CATALOG_ITEMS_PREVIEW_PER_PAGE = 50;

export const CATALOG_ITEM_NAME_MAX = 255;
export const CATALOG_ITEM_DESCRIPTION_MAX = 5000;
export const CATALOG_ITEM_MAX_DURATION = 1440;
export const CATALOG_TAG_NAME_MAX = 80;
export const CATALOG_TAG_GROUP_MAX = 80;
export type CatalogView = "categories" | "items" | "tags";
