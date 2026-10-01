import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createStylist, deleteStylist, getStylist, listStylists, updateStylist } from '@/features/stylists/api';
import type { StylistInput } from '@/features/stylists/schemas/stylist.schema';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
const stylistKey = ['dashboard', 'stylists'] as const;
export const useStylists = (params: ServerListParams) => useQuery({ queryFn: () => listStylists(params), queryKey: [...stylistKey, params] });
export function useCreateStylist() { const client = useQueryClient(); return useMutation({ mutationFn: (input: StylistInput) => createStylist(input), onSuccess: () => client.invalidateQueries({ queryKey: stylistKey }) }); }
export const useStylist = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getStylist(id), queryKey: [...stylistKey, id] });
export function useUpdateStylist() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: StylistInput }) => updateStylist(id, input), onSuccess: () => client.invalidateQueries({ queryKey: stylistKey }) }); }
export function useDeleteStylist() { const client = useQueryClient(); return useMutation({ mutationFn: deleteStylist, onSuccess: () => client.invalidateQueries({ queryKey: stylistKey }) }); }
