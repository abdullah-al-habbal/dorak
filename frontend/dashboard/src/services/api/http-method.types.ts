import type { HTTP_METHOD } from "@/services/api/http-method.constant";

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];
