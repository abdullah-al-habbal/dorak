import type { ServiceableType } from '../serviceable-type';
import type { LocalizedServiceName } from '../types/localized-service-name';

/** Zod-inferred service form values, before any field is left blank. */
export interface ServiceFormInput {
  readonly active: boolean;
  readonly catalogItemId: string | null | undefined;
  readonly currencyId: string;
  readonly duration: number | undefined;
  readonly name: LocalizedServiceName;
  readonly price: number;
  readonly serviceableId: string;
  readonly serviceableType: ServiceableType;
}
