import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    __SERVER_PORT__: Number(process.env.SERVER_PORT ?? 5174),
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost",
      },
    },
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll("\\", "/");
          const locale = /\/(?:src\/)?i18n\/locales\/([^/]+)\//.exec(normalizedId)?.[1];
          if (locale && locale !== "en") return `locale-${locale}`;
          if (normalizedId.includes("/node_modules/react-router-dom/")) return "vendor-router";
          if (normalizedId.includes("/node_modules/react/") || normalizedId.includes("/node_modules/react-dom/")) {
            return "vendor-react";
          }
          if (normalizedId.includes("/shared/src/domain/") || normalizedId.includes("/shared/src/api/")) {
            return "shared-domain";
          }
          if (normalizedId.includes("/src/domain/character/")) return "player-character-domain";

          // Keep heavy character rules in a dedicated async chunk that can be cached across
          // CharacterView, CharacterCreatorView, and LevelUpView.
          if (
            normalizedId.includes("/domain/character/parseFeatureEffects") ||
            normalizedId.includes("/domain/character/parseFeatureEffectsDerived")
          ) {
            return "character-feature-effects";
          }

          return undefined;
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.WEB_PLAYER_PORT ?? 5175),
    strictPort: true,
    allowedHosts: [
      "player.beholdenapp.com",
      "localhost",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        configure: (proxy) => {
          proxy.on("error", () => {});
        },
      },
      "/campaign-images": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        configure: (proxy) => {
          proxy.on("error", () => {});
        },
      },
      "/player-images": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        configure: (proxy) => {
          proxy.on("error", () => {});
        },
      },
      "/character-images": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        configure: (proxy) => {
          proxy.on("error", () => {});
        },
      },
      "/binder-mortal-images": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        configure: (proxy) => {
          proxy.on("error", () => {});
        },
      },
      "/ws": {
        target: `http://localhost:${Number(process.env.SERVER_PORT ?? 5174)}`,
        ws: true,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", () => {});
          proxy.on("proxyReqWs", (_proxyReq, _req, socket) => {
            socket.on("error", () => {});
          });
        },
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.WEB_PLAYER_PORT ?? 5175),
    strictPort: true,
    allowedHosts: [
      "player.beholdenapp.com",
      "localhost",
      "127.0.0.1",
    ],
  },
});
