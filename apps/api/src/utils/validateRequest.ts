import { RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";

type ValidateRequestArgs = {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
};

type FormattedZodError = {
    path: (string | number)[];
    message: string;
};

const formatZodError = (error: ZodError): FormattedZodError[] => {
    return error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
    }));
};

export const validateRequest = (args: ValidateRequestArgs): RequestHandler => {
    const handler: RequestHandler<unknown, unknown, unknown> = async (
        req,
        res,
        next
    ): Promise<void> => {
        if (args.body) {
            const bodyResult = await args.body.safeParseAsync(req.body);

            if (!bodyResult.success) {
                res.status(400).json({
                    error: formatZodError(bodyResult.error),
                    success: false,
                });
                return;
            }
        }

        if (args.query) {
            const queryResult = await args.query.safeParseAsync(req.query);

            if (!queryResult.success) {
                res.status(400).json({
                    error: formatZodError(queryResult.error),
                    success: false,
                });
                return;
            }
        }

        if (args.params) {
            const paramsResult = await args.params.safeParseAsync(req.params);

            if (!paramsResult.success) {
                res.status(400).json({
                    error: formatZodError(paramsResult.error),
                    success: false,
                });
                return;
            }
        }

        next();
    };

    return handler;
};
