import type { DashboardArea } from '@/shared/auth';

/**
 * Access is declared per operation, not per entity, because the platform admin
 * and the branch manager do not have the same surface on every entity. Branch
 * creation and deletion are platform-admin-only in Laravel
 * (`StoreBranchAction`, `DestroyBranchAction`); branch managers read and update
 * only their own branch (`UpdateBranchAction`). An omitted operation grants
 * nobody, so an entity with no form support stays unreachable.
 */
export interface EntityAccess {
  readonly create?: { readonly areas: readonly DashboardArea[] };
  readonly edit?: { readonly areas: readonly DashboardArea[] };
  readonly read: { readonly areas: readonly DashboardArea[] };
}
