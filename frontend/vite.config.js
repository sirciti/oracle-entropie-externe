// vite.config.js

export default {
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    hmr: {
      overlay: true,
    },
  },
  root: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@sentry/browser": "@sentry/browser",
      // Si tu utilises "three" dans ton code, tu peux garder l'alias ci-dessous,
      // sinon tu peux l'enlever si ça pose problème dans Docker.
      // "three": "/node_modules/three",
    },
  },
  optimizeDeps: {
    include: ["three"],
  },
};
