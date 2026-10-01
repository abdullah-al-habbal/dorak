import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateService } from '@/features/services/api';
import { invalidateServiceViews } from '@/features/services/hooks/service-query-keys';
import type { ServiceInput } from '@/features/services/schemas/service.schema';

export function useUpdateService() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, input }: { id: string; input: ServiceInput }) => updateService(id, input), onSuccess: () => invalidateServiceViews(client) }); }
