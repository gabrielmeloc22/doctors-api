import { z } from "zod";

export const getResultSchema = <T extends Record<string, z.ZodType>>(
    schema: T
): z.ZodUnion<
    [
        z.ZodObject<{ success: z.ZodLiteral<false>; error: z.ZodString }>,
        z.ZodObject<{ success: z.ZodLiteral<true> } & T>,
    ]
> =>
    z.union([
        z.object({ success: z.literal(false), error: z.string() }),
        z.object({ success: z.literal(true), ...schema }),
    ]);

export type Result<T> =
    | { success: false; error: string }
    | ({ success: true } & T);

export type RemoveResult<T> = Extract<T, { success: true }>;
