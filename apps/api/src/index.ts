import { createApp } from "./app";
import { router } from "./routes";

const port = process.env.PORT || 3001;
const app = createApp();

app.use(router);

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});
