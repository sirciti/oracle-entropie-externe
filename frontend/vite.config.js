// frontend/vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Configuration du serveur de développement Vite
  server: {
    // Port sur lequel Vite servira le front-end
    port: 5173,
    // Configuration du proxy pour les requêtes API
    proxy: {
      // Toutes les requêtes qui commencent par '/api' seront redirigées vers Flask
      // C'est le préfixe que vos appels 'fetch' dans le front-end doivent utiliser (ex: /api/generate_random)
      '/api': {
        target: 'http://127.0.0.1:5000', // L'adresse de votre serveur Flask (back-end)
        changeOrigin: true, // Nécessaire pour les hôtes virtuels basés sur le nom, important pour CORS
        rewrite: (path) => path.replace(/^\/api/, '') // Supprime '/api' du chemin de la requête avant de l'envoyer à Flask
                                                    // Ex: /api/generate_random devient /generate_random pour Flask
      },
      // Autres configurations de proxy si nécessaire. Pour l'instant, '/api' est suffisant
      // car toutes vos routes d'API Flask n'ont pas de préfixe dans leur définition (@app.route('/generate_random')).
      // Si vous aviez des routes Flask préfixées (ex: @app.route('/backend/generate_random')),
      // le rewrite serait adapté pour cela.
    }
  },
  // Spécifie le répertoire racine de votre application front-end (où se trouve index.html)
  root: './', // Par défaut, Vite utilise le dossier où se trouve vite.config.js comme racine
  // Spécifie les options de compilation pour la production
  build: {
    outDir: '../dist', // Le dossier de sortie pour les fichiers compilés (relativement à la racine du projet frontend)
    emptyOutDir: true, // Nettoie le répertoire de sortie avant la compilation
  },
  // Résolution des modules (si besoin d'alias ou de chemins spécifiques)
  resolve: {
    alias: {
      // Exemple: '@': '/src', si vos composants sont dans 'frontend/src'
    }
  },
  // Optimisation (pour les dépendances lourdes, peut être ajusté)
  optimizeDeps: {
    include: ['three'], // Assure que Three.js est pré-optimisé par Vite
  }
});