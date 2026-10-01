import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStylist } from '@/features/stylists/api';
import { invalidateStylistViews } from '@/features/stylists/hooks/stylist-query-keys';

export function useDeleteStylist() { const client = useQueryClient(); return useMutation({ mutationFn: deleteStylist, onSuccess: () => invalidateStylistViews(client) }); }
