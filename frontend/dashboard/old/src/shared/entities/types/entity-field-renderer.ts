import type { ReactNode } from 'react';
import type { EntityFieldRendererProps } from './entity-field-renderer-props';

export type EntityFieldRenderer = (props: EntityFieldRendererProps) => ReactNode;
