import { initIcosahedronVisualizer } from './visualizers/icosahedron_visualizer.js';
import { initCubesVisualizer } from './visualizers/cubes_visualizer.js';
import { initSpiralSimpleVisualizer } from './visualizers/spiral_simple_visualizer.js';
import { initSpiralTorusVisualizer } from './visualizers/spiral_torus_visualizer.js';
import { initStreamVisualizer } from './visualizers/stream_visualizer.js';
import { initTorusSpringVisualizer } from './visualizers/torus_spring_visualizer.js';
import { initCentrifugeLaserVisualizer } from './visualizers/centrifuge_laser_visualizer.js';
import { initCryptoTokenRiverVisualizer } from './visualizers/crypto_token_river_visualizer.js';
import { initCentrifugeLaserV2Visualizer } from './visualizers/centrifuge_laser_v2_visualizer.js';
import { initMetaCubeOraclePlaylist } from './visualizers/metacube_oracle_playlist.js';
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
import './utils/favicon-animator.js';
import './admin/admin-interface.js';

// Déclarer les variables globales pour les instances de visualiseurs
let icosahedronVisualizer = null;
let cubesVisualizer = null;
let spiralSimpleVisualizer = null;
let spiralTorusVisualizer = null;
let streamVisualizer = null;
let torusSpringVisualizer = null;
let centrifugeLaserVisualizer = null;
let cryptoTokenRiverVisualizer = null;
let centrifugeLaserV2Visualizer = null;
let metaCubeOracleVisualizer = null;
let currentVisualizer = null;

const visualizerConfig = [
    { sectionId: 'icosahedron-interface', visualizerId: 'icosahedron-3d', toggleId: 'toggle-icosahedron-animation', initFn: initIcosahedronVisualizer, name: 'icosahedronVisualizer' },
    { sectionId: 'cubes-interface', visualizerId: 'icosahedron-3d-cubes', toggleId: 'toggle-cubes-animation', initFn: initCubesVisualizer, name: 'cubesVisualizer' },
    { sectionId: 'spiral-simple-interface', visualizerId: 'spiral-simple-3d', toggleId: 'toggle-spiral-simple-animation', initFn: initSpiralSimpleVisualizer, name: 'spiralSimpleVisualizer' },
    { sectionId: 'spiral-torus-interface', visualizerId: 'icosahedron-3d-spiral-torus', toggleId: 'toggle-spiral-torus-animation', initFn: initSpiralTorusVisualizer, name: 'spiralTorusVisualizer' },
    { sectionId: 'torus-spring-interface', visualizerId: 'torus-spring-3d', toggleId: 'toggle-torus-spring-animation', initFn: initTorusSpringVisualizer, name: 'torusSpringVisualizer' },
    { sectionId: 'stream-interface', visualizerId: 'stream-visualizer-3d', toggleId: 'start-stream-button', initFn: initStreamVisualizer, name: 'streamVisualizer' },
    { sectionId: 'centrifuge-laser-interface', visualizerId: 'centrifuge-laser-3d', toggleId: 'toggle-centrifuge-laser-animation', initFn: initCentrifugeLaserVisualizer, name: 'centrifugeLaserVisualizer' },
    { sectionId: 'centrifuge-laser-v2-interface', visualizerId: 'centrifuge-laser-v2-3d', toggleId: 'toggle-centrifuge-laser-v2-animation', initFn: initCentrifugeLaserV2Visualizer, name: 'centrifugeLaserV2Visualizer' },
    { sectionId: 'crypto-token-river-interface', visualizerId: 'crypto-token-river-3d', toggleId: 'toggle-crypto-token-river-animation', initFn: initCryptoTokenRiverVisualizer, name: 'cryptoTokenRiverVisualizer' },
    { sectionId: 'metacube-oracle-interface', visualizerId: 'metacube-oracle-3d', toggleId: 'toggle-metacube-oracle-animation', initFn: initMetaCubeOraclePlaylist, name: 'metaCubeOracleVisualizer' },
];

function cleanupVisualizer(visualizer) {
    if (visualizer && typeof visualizer.stop === 'function') {
        visualizer.stop();
    }
    window.streamTokenInterval && clearInterval(window.streamTokenInterval);
    window.streamAnimationId && cancelAnimationFrame(window.streamAnimationId);
    window.currentAnimation && cancelAnimationFrame(window.currentAnimation);
}

function updateToggleButtonText(button, visualizerInstance) {
    if (!button) return;
    if (!visualizerInstance || typeof visualizerInstance.isRunning !== 'function') {
        button.disabled = true;
        button.textContent = 'Erreur d’initialisation';
        return;
    }
    button.disabled = false;
    button.textContent = visualizerInstance.isRunning() ? 'Stop Animation' : 'Start Animation';
}

function initAndStartVisualizer({ visualizerId, toggleId, initFn, name }) {
    const container = document.getElementById(visualizerId);
    const button = document.getElementById(toggleId);
    if (!container) {
        console.error(`Conteneur ${visualizerId} non trouvé`);
        if (button) {
            button.disabled = true;
            button.textContent = 'Erreur d’initialisation';
        }
        return null;
    }

    const tryInit = () => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            try {
                console.log(`DEBUG: Initialisation de ${name}`);
                container.style.display = 'block';
                container.innerHTML = ''; // Reset container
                const visualizer = initFn(visualizerId);
                if (visualizer && typeof visualizer.start === 'function') {
                    visualizer.start();
                    updateToggleButtonText(button, visualizer);
                    return visualizer;
                } else {
                    throw new Error(`Échec de l’initialisation de ${name}`);
                }
            } catch (error) {
                console.error(`Erreur lors de l’initialisation de ${name}:`, error);
                if (button) {
                    button.disabled = true;
                    button.textContent = 'Erreur d’initialisation';
                }
                return null;
            }
        } else {
            console.warn(`Initialisation différée pour ${visualizerId}: dimensions non prêtes. Réessai...`);
            return null;
        }
    };

    if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        return tryInit();
    } else {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === container && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    const visualizer = tryInit();
                    if (visualizer) {
                        currentVisualizer = visualizer;
                        observer.disconnect();
                    }
                }
            }
        });
        observer.observe(container);
        // Délai de secours pour forcer une tentative après 1 seconde
        setTimeout(() => {
            if (!currentVisualizer) {
                console.log(`Délai de secours atteint pour ${visualizerId}. Nouvelle tentative forcée.`);
                const visualizer = tryInit();
                if (visualizer) {
                    currentVisualizer = visualizer;
                }
            }
        }, 1000);
        return null;
    }
}

function setupToggleButtonForVisualizer(visualizerId, toggleId, initFn, name) {
    const button = document.getElementById(toggleId);
    if (!button) return;

    button.addEventListener('click', async () => {
        if (!currentVisualizer || typeof currentVisualizer.isRunning !== 'function') {
            console.warn(`Réinitialisation de ${name} en raison d’un visualiseur invalide`);
            currentVisualizer = await initAndStartVisualizer({ visualizerId, toggleId, initFn, name });
            return;
        }

        if (currentVisualizer.isRunning()) {
            currentVisualizer.stop();
        } else {
            currentVisualizer.start();
        }
        updateToggleButtonText(button, currentVisualizer);
    });
}

function showSection(sectionId) {
    if (window.navigationLocked) return;
    window.navigationLocked = true;

    cleanupVisualizer(currentVisualizer);
    currentVisualizer = null;

    if (sectionId === 'admin-interface') {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
    } else {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
    }

    document.querySelectorAll('.interface-section').forEach(section => {
        section.classList.add('hidden');
        section.style.display = 'none';
        section.style.visibility = 'hidden';
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.style.display = 'flex';
        targetSection.style.visibility = 'visible';

        const config = visualizerConfig.find(cfg => cfg.sectionId === sectionId);
        if (config) {
            initAndStartVisualizer(config).then(visualizer => {
                currentVisualizer = visualizer;
                setupToggleButtonForVisualizer(config.visualizerId, config.toggleId, config.initFn, config.name);
            });
        }
    }

    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    let navButtonId = `nav-${sectionId.replace('-interface', '')}`;
    const navButton = document.getElementById(navButtonId);
    if (navButton) {
        navButton.classList.add('active');
    } else {
        console.warn(`Bouton de navigation ${navButtonId} non trouvé`);
    }

    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.navigationLocked = false;
    }, 100);
}

function setupNavButton(buttonId, sectionId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => showSection(sectionId));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    visualizerConfig.forEach(({ sectionId }) => {
        let navButtonId = `nav-${sectionId.replace('-interface', '')}`;
        setupNavButton(navButtonId, sectionId);
    });
    // Ajouter manuellement les boutons non couverts par visualizerConfig
    setupNavButton('nav-main', 'main-interface');
    setupNavButton('nav-internal-tool', 'internal-tool-interface');
    setupNavButton('nav-admin-interface', 'admin-interface');

    // Initialiser les vues non-3D
    try {
        initClassicGenerator();
        initInternalTool();
    } catch (error) {
        console.error("Erreur lors de l'initialisation des vues non-3D :", error);
    }

    showSection('main-interface');

    window.addEventListener('resize', () => {
        if (currentVisualizer && typeof currentVisualizer.resize === 'function') {
            currentVisualizer.resize();
        }
    });
});