import { servicesConfig } from './services.config';

export const entityConfigs = { services: servicesConfig } as const;

export function getEntityConfig(slug: string): typeof servicesConfig | undefined {
  return slug === 'services' ? servicesConfig : undefined;
}

export { servicesConfig } from './services.config';
