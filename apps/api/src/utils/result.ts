export type Result<T> =
    | { success: false; error: string }
    | ({ success: true } & T);

export type RemoveResult<T> = Extract<T, { success: true }>;
