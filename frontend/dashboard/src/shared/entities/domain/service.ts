export interface LocalizedServiceName {
  readonly ar: string;
  readonly en: string;
}

export interface Service {
  readonly active: boolean;
  readonly catalog_item_id: string | null;
  readonly currency_id: string;
  readonly duration: number | null;
  readonly id: string;
  readonly name: LocalizedServiceName;
  readonly price: number;
  readonly serviceable_id: string;
  readonly serviceable_type: 'barber' | 'brand' | 'branch';
}
