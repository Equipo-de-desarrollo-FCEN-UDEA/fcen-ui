import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

function copyTheme(): Plugin {
  return {
    name: "copy-theme",
    apply: "build",
    closeBundle() {
      copyFileSync(resolve(__dirname, "src/theme.css"), resolve(__dirname, "dist/theme.css"));
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.build.json", entryRoot: "src" }),
    copyTheme(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "clsx", "lucide-react"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.{ts,tsx}", "src/test/**", "src/index.ts"],
      reporter: ["text", "lcov"],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
