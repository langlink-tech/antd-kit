import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    onUnhandledError(error) {
      const stack = typeof error === "object" && error && "stack" in error ? String(error.stack) : "";
      if (stack.includes("antd/lib/_util/ActionButton.js")) return false;
    },
  },
});
