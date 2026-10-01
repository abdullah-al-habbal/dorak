'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { serviceSchema, type ServiceInput } from '@/features/services/schemas/service.schema';
export function ServiceForm({ isPending, onSubmit }: Readonly<{ isPending: boolean; onSubmit: (input: ServiceInput) => void }>) { const form = useForm<ServiceInput>({ resolver: zodResolver(serviceSchema) }); return <form onSubmit={form.handleSubmit(onSubmit)}><input aria-label="English service name" {...form.register('name.en')} /><input aria-label="Arabic service name" {...form.register('name.ar')} /><input aria-label="Duration" type="number" {...form.register('duration')} /><input aria-label="Price" type="number" {...form.register('price')} /><button className="bg-primary p-2 text-background" disabled={isPending} type="submit">Create service</button></form>; }
