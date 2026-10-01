interface LocalizedServiceName { ar: string; en: string; }
export interface Service { id: string; active: boolean; catalog_item_id: string | null; currency_id: string; duration: number | null; name: LocalizedServiceName; price: number; serviceable_id: string; serviceable_type: 'branch' | 'brand' | 'barber'; }
