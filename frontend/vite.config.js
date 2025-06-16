// frontend/vite.config.js
import { defineConfig } from "vite";
// import { sentryVitePlugin } from "@sentry/vite-plugin"; // optionnel
import { fileURLToPath, URL } from "url";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    hmr: {
      overlay: true,
    },
    // hmr: false, // pour désactiver le hot reload
  },
  root: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@sentry/browser": "@sentry/browser",
      "three": fileURLToPath(new URL("./node_modules/three", import.meta.url)),
      // Ajoute d’autres alias personnalisés ici si besoin
      // Exemple : "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["three"],
  },
  // plugins: [
  //   sentryVitePlugin({
  //     org: "TON_ORG",
  //     project: "TON_PROJECT",
  //     authToken: "TON_AUTH_TOKEN",
  //     // Autres options Sentry…
  //   }),
  // ],
});
