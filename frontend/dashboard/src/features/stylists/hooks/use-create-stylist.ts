import { createStylist } from '@/features/stylists/api';
import { STYLIST_QUERY_KEYS } from '@/features/stylists/hooks/stylist-query-keys';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useCreateStylist() {
  return useInvalidatingMutation({ mutationFn: (input: StylistInput) => createStylist(input) }, [
    STYLIST_QUERY_KEYS.all,
  ]);
}
