import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: { "server-only": src("test/server-only-stub.ts"), "@": src("") },
  },
  test: { include: ["src/**/*.test.ts"], testTimeout: 120_000 },
});
