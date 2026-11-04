export type DeepString<T> = T extends string ? string : { -readonly [K in keyof T]: DeepString<T[K]> };
