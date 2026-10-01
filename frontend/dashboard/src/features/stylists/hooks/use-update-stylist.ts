import { updateStylist } from '@/features/stylists/api';
import { STYLIST_QUERY_KEYS } from '@/features/stylists/hooks/stylist-query-keys';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import { useInvalidatingMutation } from '@/shared/hooks';

export function useUpdateStylist() { return useInvalidatingMutation({ mutationFn: ({ id, input }: { id: string; input: StylistInput }) => updateStylist(id, input) }, [STYLIST_QUERY_KEYS.all]); }
