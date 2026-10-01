import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteService } from '@/features/services/api';
import { invalidateServiceViews } from '@/features/services/hooks/service-query-keys';

export function useDeleteService() { const client = useQueryClient(); return useMutation({ mutationFn: deleteService, onSuccess: () => invalidateServiceViews(client) }); }
