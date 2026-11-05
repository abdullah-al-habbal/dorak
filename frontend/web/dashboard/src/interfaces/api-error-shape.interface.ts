export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}
