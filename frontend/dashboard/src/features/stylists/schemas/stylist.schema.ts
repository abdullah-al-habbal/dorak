import { z } from 'zod';
const fields = { chair_id: z.string().uuid().nullable().optional(), email: z.string().email(), name: z.object({ ar: z.string().min(2).max(120), en: z.string().min(2).max(120) }), phone: z.string().min(7).max(30).nullable().optional(), status: z.enum(['pending', 'enabled', 'disabled']).optional() };
export const createStylistSchema = z.object({ ...fields, password: z.string().min(12).max(255) });
export const updateStylistSchema = z.object({ ...fields, password: z.string().min(12).max(255).optional() });
export type StylistInput = z.infer<typeof createStylistSchema>;
