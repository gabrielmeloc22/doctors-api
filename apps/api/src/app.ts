import bodyParser from "body-parser";
import cors from "cors";
import express, { type Express } from "express";
import { router } from "./routes";

export const createApp = (): Express => {
    const app = express();

    app.disable("x-powered-by");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());

    app.use(router);

    return app;
};
