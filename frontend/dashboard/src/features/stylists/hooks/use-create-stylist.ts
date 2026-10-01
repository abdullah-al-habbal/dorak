import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStylist } from '@/features/stylists/api';
import { invalidateStylistViews } from '@/features/stylists/hooks/stylist-query-keys';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';

export function useCreateStylist() { const client = useQueryClient(); return useMutation({ mutationFn: (input: StylistInput) => createStylist(input), onSuccess: () => invalidateStylistViews(client) }); }
