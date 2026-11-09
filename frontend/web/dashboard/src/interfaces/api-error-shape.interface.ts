export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  fields?: Record<string, string[]>;
}
