import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createService } from '@/features/services/api';
import { invalidateServiceViews } from '@/features/services/hooks/service-query-keys';
import type { ServiceInput } from '@/features/services/schemas/service.schema';

export function useCreateService() { const client = useQueryClient(); return useMutation({ mutationFn: (input: ServiceInput) => createService(input), onSuccess: () => invalidateServiceViews(client) }); }
