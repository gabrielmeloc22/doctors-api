import { createApp } from "./app"

const port = process.env.PORT || 3001
const server = createApp()

server.listen(port, () => {})
