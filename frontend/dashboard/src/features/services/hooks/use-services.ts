import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createService, deleteService, getService, listServices, updateService } from '@/features/services/api/services.api';
import type { ServiceInput } from '@/features/services/schemas/service.schema';
import type { ServerListParams } from '@/shared/hooks/use-server-query-params';
const serviceKey = ['dashboard', 'services'] as const;
export const useServices = (params: ServerListParams) => useQuery({ queryFn: () => listServices(params), queryKey: [...serviceKey, params] });
export function useCreateService() { const client = useQueryClient(); return useMutation({ mutationFn: (input: ServiceInput) => createService(input), onSuccess: () => client.invalidateQueries({ queryKey: serviceKey }) }); }
export const useService = (id: string) => useQuery({ enabled: id !== '', queryFn: () => getService(id), queryKey: [...serviceKey, id] });
export function useUpdateService() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: ServiceInput }) => updateService(id, input), onSuccess: () => client.invalidateQueries({ queryKey: serviceKey }) }); }
export function useDeleteService() { const client = useQueryClient(); return useMutation({ mutationFn: deleteService, onSuccess: () => client.invalidateQueries({ queryKey: serviceKey }) }); }
