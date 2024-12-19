import { RequestHandler } from "express";
import { AnyZodObject } from "zod";

type ValidateRequestArgs = {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
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
                res.status(400).json(bodyResult.error);
                return;
            }
        }

        if (args.query) {
            const queryResult = await args.query.safeParseAsync(req.query);

            if (!queryResult.success) {
                res.status(400).json(queryResult.error);
                return;
            }
        }

        if (args.params) {
            const paramsResult = await args.params.safeParseAsync(req.params);

            if (!paramsResult.success) {
                res.status(400).json(paramsResult.error);
                return;
            }
        }

        next();
    };

    return handler;
};
