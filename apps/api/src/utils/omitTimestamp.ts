export type OmitTimestamp<T> = Omit<T, "createdAt" | "updatedAt">;
