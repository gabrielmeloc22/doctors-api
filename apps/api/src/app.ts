import bodyParser from "body-parser"
import cors from "cors"
import express, { type Express } from "express"
import morgan from "morgan"

export const createApp = (): Express => {
    const app = express()

    app.disable("x-powered-by")
        .use(morgan("dev"))
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .use(cors())

    return app
}
