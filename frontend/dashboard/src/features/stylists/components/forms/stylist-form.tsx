'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createStylistSchema, type StylistInput } from '@/features/stylists/schemas/stylist.schema';
export function StylistForm({ isPending, onSubmit }: Readonly<{ isPending: boolean; onSubmit: (input: StylistInput) => void }>) { const form = useForm<StylistInput>({ resolver: zodResolver(createStylistSchema) }); return <form onSubmit={form.handleSubmit(onSubmit)}><input aria-label="English stylist name" {...form.register('name.en')} /><input aria-label="Arabic stylist name" {...form.register('name.ar')} /><input aria-label="Stylist email" {...form.register('email')} /><input aria-label="Stylist phone" {...form.register('phone')} /><button className="bg-primary p-2 text-background" disabled={isPending} type="submit">Create stylist</button></form>; }
