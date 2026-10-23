export interface IBranchOpeningDay {
  weekday: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
}
