type SanitizeTestObjectArgs = {
    obj?: Record<string, unknown>;
    frozenKeys?: string[];
};

export const defaultFrozenKeys = ["id", "createdAt", "updatedAt"];

export const sanitizeTestObject = (
    args: SanitizeTestObjectArgs
): Record<string, unknown> => {
    if (!args.obj) {
        return {};
    }

    return Object.entries(args.obj).reduce((acc, [k, v]) => {
        if (args.frozenKeys?.includes(k)) {
            return { ...acc, [k]: `FROZEN-${k.toUpperCase()}` };
        }

        if (v && Array.isArray(v)) {
            return {
                ...acc,
                [k]: v.map((item: Record<string, unknown>) =>
                    sanitizeTestObject({ ...args, obj: item })
                ),
            };
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (v && Object.getPrototypeOf(v).constructor.name === "Object") {
            return {
                ...acc,
                [k]: sanitizeTestObject({
                    ...args,
                    obj: v as Record<string, unknown>,
                }),
            };
        }

        return { ...acc, [k]: v };
    }, {});
};
