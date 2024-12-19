type SanitizeTestObjectArgs = {
    obj?: Record<string, unknown>;
    frozenKeys?: string[];
};

export const defaultFrozenKeys = ["id"];

export const sanitizeTestObject = (
    args: SanitizeTestObjectArgs
): Record<string, unknown> => {
    if (!args.obj) {
        return {};
    }

    return Object.entries(args.obj).reduce((acc, [k, v]) => {
        if (args.frozenKeys?.includes(k)) {
            return acc;
        }

        return { ...acc, [k]: v };
    }, {});
};
