import { deleteStylist } from '@/features/stylists/api';
import { STYLIST_QUERY_KEYS } from '@/features/stylists/hooks/stylist-query-keys';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useDeleteStylist() {
  return useInvalidatingMutation({ mutationFn: deleteStylist }, [STYLIST_QUERY_KEYS.all]);
}
