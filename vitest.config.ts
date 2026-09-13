import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // AntD ActionButton re-rejects a failed onConfirm so the popover stays open.
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
