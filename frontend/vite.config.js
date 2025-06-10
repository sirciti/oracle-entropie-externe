// frontend/vite.config.js
import { defineConfig } from "vite";
// import { sentryVitePlugin } from "@sentry/vite-plugin"; // optionnel

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://backend:5000", // <--- le nom du service Docker Compose !
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
