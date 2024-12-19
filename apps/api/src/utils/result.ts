export type Result<T> =
    | { success: false; error: string }
    | ({ success: true } & T);
