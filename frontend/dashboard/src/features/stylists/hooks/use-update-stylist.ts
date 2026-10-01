import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStylist } from '@/features/stylists/api';
import { invalidateStylistViews } from '@/features/stylists/hooks/stylist-query-keys';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';

export function useUpdateStylist() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: StylistInput }) => updateStylist(id, input), onSuccess: () => invalidateStylistViews(client) }); }
