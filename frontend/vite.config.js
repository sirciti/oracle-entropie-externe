// frontend/vite.config.js
import { defineConfig } from "vite";
// Pour une intégration avancée de Sentry, ajoute si besoin :
// import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    // Pour afficher les erreurs dans un overlay en développement
    hmr: {
      overlay: true,
    },
    // Si tu veux désactiver totalement le hot reload, remplace la ligne ci-dessus par :
    // hmr: false,
  },
  root: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@sentry/browser": "@sentry/browser",
      // Ajoute d’autres alias personnalisés ici si besoin
      // Exemple : "@": "/src",
    },
  },
  optimizeDeps: {
    include: ["three"],
  },
  // Pour une intégration avancée de Sentry (optionnel) :
  // plugins: [
  //   sentryVitePlugin({
  //     org: "TON_ORG",
  //     project: "TON_PROJECT",
  //     authToken: "TON_AUTH_TOKEN",
  //     // Autres options Sentry…
  //   }),
  // ],
});
