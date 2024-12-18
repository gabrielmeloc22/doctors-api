import { RequestHandler } from "express";

export const routeNotImplemented: RequestHandler = (_req, res) => {
    res.status(501);
    res.end();
};
