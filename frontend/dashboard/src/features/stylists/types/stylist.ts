export interface Stylist {
  id: string;
  email: string;
  name: { ar: string; en: string };
  phone: string | null;
  status: 'pending' | 'enabled' | 'disabled';
}
