import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/CrocodileGame/",
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setupTests.ts",

    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        functions: 60,
        branches: 60,
        lines: 60,
      },
    },
  },
});
