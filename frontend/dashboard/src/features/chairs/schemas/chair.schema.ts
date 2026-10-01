import { z } from 'zod';
export const chairSchema = z.object({ barber_id: z.string().uuid().nullable().optional(), branch_id: z.string().uuid(), floor_zone: z.enum(['men', 'women', 'shared']), label: z.string().min(1).max(120), status: z.enum(['available', 'occupied', 'maintenance']), ui_metadata: z.object({ height: z.coerce.number().positive(), position_x: z.coerce.number(), position_y: z.coerce.number(), rotation: z.coerce.number().optional(), width: z.coerce.number().positive() }) });
export type ChairInput = z.infer<typeof chairSchema>;
