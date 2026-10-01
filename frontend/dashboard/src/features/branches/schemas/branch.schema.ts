import { z } from 'zod';

const localizedNameSchema = z.object({ ar: z.string().min(2).max(120), en: z.string().min(2).max(120) });
const branchFields = { brand_id: z.string().uuid(), email: z.string().email(), latitude: z.coerce.number().min(-90).max(90).optional(), longitude: z.coerce.number().min(-180).max(180).optional(), name: localizedNameSchema, status: z.enum(['pending', 'enabled', 'disabled']).optional() };

export const createBranchSchema = z.object({ ...branchFields, password: z.string().min(12).max(255) });
export const updateBranchSchema = z.object({ ...branchFields, password: z.string().min(12).max(255).optional() });
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
