import * as THREE from "three";
import { initMetaCubeOracleVisualizer } from './metacube_oracle_visualizer.js';
import { initMetaCubeOracleVisualizerV2 } from './metacube_oracle_visualizer_v2.js';
import { initMetaCubeOracleVisualizerV3 } from './metacube_oracle_visualizer_v3.js';
import { initMetaCubeOracleVisualizerV4 } from './metacube_oracle_visualizer_v4.js';

// Configuration simplifiée
const PLAYLIST_CONFIG = [
  { name: 'MetaCube Oracle V1', initFunction: initMetaCubeOracleVisualizer },
  { name: 'MetaCube Oracle V2', initFunction: initMetaCubeOracleVisualizerV2 },
  { name: 'MetaCube Oracle V3', initFunction: initMetaCubeOracleVisualizerV3 },
  { name: 'MetaCube Oracle V4', initFunction: initMetaCubeOracleVisualizerV4 }
];

let currentVisualizerInstance = null;
let currentVersion = 0; // 0-3 pour les 4 versions
let isPlaylistRunning = false;
let playlistTimer = null;
const PLAYLIST_INTERVAL = 15000; // 15 secondes par version

export function initMetaCubeOraclePlaylist(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT METACUBE_PLAYLIST ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  console.log("🎵 METACUBE PLAYLIST: Initialisation du système de playlist");

  // Charger la première version
  loadVisualizerVersion(currentVersion);

  // Configuration des event listeners pour les contrôles
  setupPlaylistControls();

  function createFallbackVisualizer(containerId) {
    // Visualiseur de fallback simple
    const container = document.getElementById(containerId);
    if (!container) return null;

    container.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #00ffff;
        font-size: 24px;
        text-align: center;
        background: linear-gradient(45deg, #001122, #003344);
        border-radius: 12px;
      ">
        <div>
          <div style="font-size: 48px; margin-bottom: 20px;">🌀</div>
          <div>MetaCube Oracle</div>
          <div style="font-size: 16px; margin-top: 10px; opacity: 0.7;">Version non disponible</div>
        </div>
      </div>
    `;

    return {
      start: () => console.log("Fallback visualizer started"),
      stop: () => console.log("Fallback visualizer stopped"),
      isRunning: () => true,
      cleanup: () => {
        if (container) container.innerHTML = '';
      }
    };
  }

  function loadVisualizerVersion(versionIndex) {
    console.log(`🔄 METACUBE PLAYLIST: Chargement de la version ${versionIndex + 1}/4`);

    // Nettoyer l'instance précédente
    if (currentVisualizerInstance) {
      try {
        currentVisualizerInstance.stop();
        if (currentVisualizerInstance.cleanup) {
          currentVisualizerInstance.cleanup();
        }
      } catch (error) {
        console.warn("Erreur lors du nettoyage:", error);
      }
      currentVisualizerInstance = null;
    }

    // Nettoyer le conteneur
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Attendre un peu pour le nettoyage
    setTimeout(() => {
      const config = PLAYLIST_CONFIG[versionIndex];
      if (config && config.initFunction) {
        try {
          currentVisualizerInstance = config.initFunction(containerId);

          if (currentVisualizerInstance) {
            // Démarrer automatiquement
            setTimeout(() => {
              if (currentVisualizerInstance && currentVisualizerInstance.start) {
                currentVisualizerInstance.start();
              }
            }, 200);

            console.log(`✅ METACUBE PLAYLIST: ${config.name} chargé et démarré`);
          }
        } catch (error) {
          console.error(`❌ Erreur lors du chargement de ${config.name}:`, error);
          // Charger le fallback
          currentVisualizerInstance = createFallbackVisualizer(containerId);
        }
      }
      // Mettre à jour l'affichage
      updateVersionDisplay();
    }, 100);
  }

  function setupPlaylistControls() {
    // Attendre que les éléments DOM soient disponibles
    setTimeout(() => {
      const startBtn = document.getElementById('start-slideshow');
      const stopBtn = document.getElementById('stop-slideshow');
      const nextBtn = document.getElementById('next-version');
      
      if (startBtn) {
        startBtn.textContent = '🎵 Démarrer Playlist';
        startBtn.addEventListener('click', startPlaylist);
      }
      
      if (stopBtn) {
        stopBtn.textContent = '⏹️ Arrêter Playlist';
        stopBtn.addEventListener('click', stopPlaylist);
      }
      
      if (nextBtn) {
        nextBtn.textContent = '⏭️ Version Suivante';
        nextBtn.addEventListener('click', nextVersion);
      }

      console.log("🎛️ METACUBE PLAYLIST: Contrôles configurés");
    }, 500);
  }

  function startPlaylist() {
    if (isPlaylistRunning) return;
    
    isPlaylistRunning = true;
    console.log("🎵 METACUBE PLAYLIST: Démarrage de la playlist automatique");
    
    // Démarrer le timer pour changer automatiquement
    playlistTimer = setInterval(() => {
      nextVersion();
    }, PLAYLIST_INTERVAL);
    
    updateVersionDisplay();
    
    // Mettre à jour les boutons
    const startBtn = document.getElementById('start-slideshow');
    if (startBtn) {
      startBtn.textContent = '🎵 Playlist Active';
      startBtn.disabled = true;
    }
  }

  function stopPlaylist() {
    if (!isPlaylistRunning) return;
    
    isPlaylistRunning = false;
    
    if (playlistTimer) {
      clearInterval(playlistTimer);
      playlistTimer = null;
    }
    
    console.log("⏹️ METACUBE PLAYLIST: Playlist arrêtée");
    
    // Mettre à jour les boutons
    const startBtn = document.getElementById('start-slideshow');
    if (startBtn) {
      startBtn.textContent = '🎵 Démarrer Playlist';
      startBtn.disabled = false;
    }
    
    updateVersionDisplay();
  }

  function nextVersion() {
    currentVersion = (currentVersion + 1) % PLAYLIST_CONFIG.length;
    loadVisualizerVersion(currentVersion);
    
    console.log(`⏭️ METACUBE PLAYLIST: Passage à la version ${currentVersion + 1}/4`);
  }

  function updateVersionDisplay() {
    const versionDisplay = document.getElementById('current-version-display');
    if (versionDisplay) {
      const config = PLAYLIST_CONFIG[currentVersion];
      const statusText = isPlaylistRunning ? '🎵' : '⏸️';
      versionDisplay.textContent = `${statusText} ${config.name} (${currentVersion + 1}/4)`;
    }

    // Mettre à jour les métriques d'entropie si disponibles
    const shannonDisplay = document.getElementById('shannon-entropy-display');
    const accumulatorDisplay = document.getElementById('entropy-accumulator-display');
    
    if (shannonDisplay) {
      shannonDisplay.textContent = (Math.random() * 5 + 0.5).toFixed(4);
    }
    if (accumulatorDisplay) {
      accumulatorDisplay.textContent = (Math.random() * 10 + 5).toFixed(2);
    }
  }

  function cleanup() {
    console.log("🧹 METACUBE PLAYLIST: Nettoyage complet");
    
    stopPlaylist();
    
    if (currentVisualizerInstance) {
      try {
        currentVisualizerInstance.stop();
        if (currentVisualizerInstance.cleanup) {
          currentVisualizerInstance.cleanup();
        }
      } catch (error) {
        console.warn("Erreur lors du nettoyage final:", error);
      }
      currentVisualizerInstance = null;
    }

    while (container && container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  // Interface publique
  return {
    start: () => {
      if (currentVisualizerInstance && currentVisualizerInstance.start) {
        currentVisualizerInstance.start();
      }
    },
    stop: () => {
      stopPlaylist();
      if (currentVisualizerInstance && currentVisualizerInstance.stop) {
        currentVisualizerInstance.stop();
      }
    },
    isRunning: () => {
      return currentVisualizerInstance ? currentVisualizerInstance.isRunning() : false;
    },
    cleanup: cleanup,
    startPlaylist: startPlaylist,
    stopPlaylist: stopPlaylist,
    nextVersion: nextVersion,
    getCurrentVersion: () => currentVersion + 1,
    getTotalVersions: () => PLAYLIST_CONFIG.length
  };
}
