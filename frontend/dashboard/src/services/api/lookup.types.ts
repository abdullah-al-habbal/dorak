export interface LookupOption {
  id: string;
  label: string;
  /** Brands only: the brand already has a branch and lacks `multi_branch`, so another branch would be refused (A3). */
  branchLimitReached?: boolean;
}

export type LookupResource = "brands" | "currencies" | "service-catalog-items";
