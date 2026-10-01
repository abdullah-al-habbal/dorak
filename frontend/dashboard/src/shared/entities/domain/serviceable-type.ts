export const serviceableTypeValues = ['barber', 'brand', 'branch'] as const;

export type ServiceableType = (typeof serviceableTypeValues)[number];
