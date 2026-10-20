import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@tanstack/router-core",
        "@tanstack/router-core/isServer",
        "@tanstack/router-core/ssr/client",
        "@tanstack/history",
        "seroval",
      ],
    },
  },
  plugins: [
    nodePolyfills({
      include: ["buffer", "util", "events"],
      globals: { Buffer: true, global: true, process: false },
      protocolImports: true,
    }),
  ],
});
