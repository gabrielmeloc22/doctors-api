import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: [
            "./src/testUtils/setupMocks.ts",
            "./src/scripts/zodExtend.ts",
        ],
    },
});
