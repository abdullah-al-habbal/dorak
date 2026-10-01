import { z } from 'zod';
export const serviceSchema = z.object({ active: z.boolean().optional(), catalog_item_id: z.string().uuid().nullable().optional(), currency_id: z.string().uuid(), duration: z.coerce.number().int().min(1).max(1_440).optional(), name: z.object({ ar: z.string().min(2).max(120), en: z.string().min(2).max(120) }), price: z.coerce.number().nonnegative(), serviceable_id: z.string().uuid(), serviceable_type: z.enum(['branch', 'brand', 'barber']) });
export type ServiceInput = z.infer<typeof serviceSchema>;
