// Importe les fonctions d'initialisation des visualiseurs et des vues non-3D
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
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
import './favicon-animator.js';
import './admin/admin-interface.js';

// Déclarer les variables globales en haut du fichier
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
let currentSection = null;

// Fonction d'aide pour gérer le texte des boutons Start/Stop
function updateToggleButtonText(buttonElement, visualizerInstance) {
    if (buttonElement && visualizerInstance && typeof visualizerInstance.isRunning === 'function') {
        buttonElement.textContent = visualizerInstance.isRunning() ? "Stop Animation" : "Start Animation";
        buttonElement.disabled = false;
    } else if (buttonElement) {
        buttonElement.textContent = "Start Animation";
        buttonElement.disabled = true;
        console.warn(`Visualizer instance invalid for ${buttonElement.id}`);
    }
}

// Fonction principale pour afficher une section et cacher/initialiser les autres
function showSection(sectionId) {
    console.log("DEBUG: Changement vers section:", sectionId);

    // NE PAS nettoyer si on reste sur la même section
    if (currentSection === sectionId) {
        console.log("DEBUG: Même section, pas de nettoyage");
        return;
    }

    currentSection = sectionId;

    // 1. Sélectionne toutes les sections d'interface
    const mainInterfaceSection = document.getElementById('main-interface');
    const icosahedronInterfaceSection = document.getElementById('icosahedron-interface');
    const cubesInterfaceSection = document.getElementById('cubes-interface');
    const spiralSimpleInterfaceSection = document.getElementById('spiral-simple-interface');
    const spiralTorusInterfaceSection = document.getElementById('spiral-torus-interface');
    const streamInterfaceSection = document.getElementById('stream-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const torusSpringInterfaceSection = document.getElementById('torus-spring-interface');
    const centrifugeLaserInterfaceSection = document.getElementById('centrifuge-laser-interface');
    const cryptoTokenRiverInterfaceSection = document.getElementById('crypto-token-river-interface');
    const centrifugeLaserV2InterfaceSection = document.getElementById('centrifuge-laser-v2-interface');
    const metaCubeOracleInterfaceSection = document.getElementById('metacube-oracle-interface');

    // 2. Cache toutes les sections et arrête les animations des visualiseurs
    const allSections = [
        mainInterfaceSection, icosahedronInterfaceSection, cubesInterfaceSection,
        spiralSimpleInterfaceSection, spiralTorusInterfaceSection,
        streamInterfaceSection, internalToolInterfaceSection, torusSpringInterfaceSection,
        centrifugeLaserInterfaceSection, cryptoTokenRiverInterfaceSection,
        centrifugeLaserV2InterfaceSection, metaCubeOracleInterfaceSection
    ];
    allSections.forEach(section => {
        if (section) section.classList.add('hidden');
    });

    // Arrête et nettoie tous les visualiseurs actifs
    cleanupVisualizer(icosahedronVisualizer);
    cleanupVisualizer(cubesVisualizer);
    cleanupVisualizer(spiralSimpleVisualizer);
    cleanupVisualizer(spiralTorusVisualizer);
    cleanupVisualizer(streamVisualizer);
    cleanupVisualizer(torusSpringVisualizer);
    cleanupVisualizer(centrifugeLaserVisualizer);
    cleanupVisualizer(cryptoTokenRiverVisualizer);
    cleanupVisualizer(centrifugeLaserV2Visualizer);
    cleanupVisualizer(metaCubeOracleVisualizer);
    icosahedronVisualizer = null;
    cubesVisualizer = null;
    spiralSimpleVisualizer = null;
    spiralTorusVisualizer = null;
    streamVisualizer = null;
    torusSpringVisualizer = null;
    centrifugeLaserVisualizer = null;
    cryptoTokenRiverVisualizer = null;
    centrifugeLaserV2Visualizer = null;
    metaCubeOracleVisualizer = null;

    // 3. Gère la visibilité des conteneurs 3D
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes');
    const spiralSimple3DContainer = document.getElementById('spiral-simple-3d');
    const spiralTorus3DContainer = document.getElementById('icosahedron-3d-spiral-torus');
    const streamVisualizer3DContainer = document.getElementById('stream-visualizer-3d');
    const torusSpring3DContainer = document.getElementById('torus-spring-3d');
    const centrifugeLaser3DContainer = document.getElementById('centrifuge-laser-3d');
    const cryptoTokenRiver3DContainer = document.getElementById('crypto-token-river-3d');
    const centrifugeLaserV23DContainer = document.getElementById('centrifuge-laser-v2-3d');
    const metaCubeOracle3DContainer = document.getElementById('metacube-oracle-3d');

    const all3DContainers = [
        icosahedron3DContainer, cubes3DContainer,
        spiralSimple3DContainer, spiralTorus3DContainer, streamVisualizer3DContainer,
        torusSpring3DContainer, centrifugeLaser3DContainer, cryptoTokenRiver3DContainer,
        centrifugeLaserV23DContainer, metaCubeOracle3DContainer
    ];
    all3DContainers.forEach(container => {
        if (container) {
            container.style.display = 'none';
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    });

    // 4. Affiche la section demandée
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // 5. Initialise ou réinitialise et démarre le visualiseur correspondant
    const initAndStartVisualizer = async (visualizerName, initFunc, containerId, toggleBtnId) => {
        const containerElement = document.getElementById(containerId);
        const toggleButtonElement = document.getElementById(toggleBtnId);

        if (containerElement) containerElement.style.display = 'flex';

        const initWithRAF = () => {
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    if (containerElement && containerElement.clientWidth > 0 && containerElement.clientHeight > 0) {
                        let visualizerInstance = null;

                        console.log(`DEBUG: Initialisation de ${visualizerName}`);
                        try {
                            if (visualizerName === 'metaCubeOracleVisualizer') {
                                visualizerInstance = metaCubeOracleVisualizer = initFunc(containerId);
                                requestAnimationFrame(() => {
                                    if (visualizerInstance && typeof visualizerInstance.start === 'function') {
                                        visualizerInstance.start();
                                    }
                                });
                            } else {
                                if (visualizerName === 'icosahedronVisualizer') visualizerInstance = icosahedronVisualizer = initFunc(containerId);
                                else if (visualizerName === 'cubesVisualizer') visualizerInstance = cubesVisualizer = initFunc(containerId);
                                else if (visualizerName === 'spiralSimpleVisualizer') visualizerInstance = spiralSimpleVisualizer = initFunc(containerId);
                                else if (visualizerName === 'spiralTorusVisualizer') visualizerInstance = spiralTorusVisualizer = initFunc(containerId);
                                else if (visualizerName === 'streamVisualizer') visualizerInstance = streamVisualizer = initFunc(containerId);
                                else if (visualizerName === 'torusSpringVisualizer') visualizerInstance = torusSpringVisualizer = initFunc(containerId);
                                else if (visualizerName === 'centrifugeLaserVisualizer') visualizerInstance = centrifugeLaserVisualizer = initFunc(containerId);
                                else if (visualizerName === 'cryptoTokenRiverVisualizer') visualizerInstance = cryptoTokenRiverVisualizer = initFunc(containerId);
                                else if (visualizerName === 'centrifugeLaserV2Visualizer') visualizerInstance = centrifugeLaserV2Visualizer = initFunc(containerId);

                                if (visualizerInstance && initFunc !== initStreamVisualizer && typeof visualizerInstance.start === 'function') {
                                    visualizerInstance.start();
                                }
                            }

                            updateToggleButtonText(toggleButtonElement, visualizerInstance);
                            resolve(visualizerInstance);
                        } catch (error) {
                            console.error(`Erreur lors de l'initialisation de ${visualizerName}:`, error);
                            if (toggleButtonElement) {
                                toggleButtonElement.disabled = true;
                                toggleButtonElement.textContent = "Erreur d'initialisation";
                            }
                            resolve(null);
                        }
                    } else {
                        console.warn(`Initialisation différée pour ${containerId}: dimensions non prêtes. Réessai...`);
                        setTimeout(() => initWithRAF().then(resolve), 50);
                    }
                });
            });
        };

        return initWithRAF();
    };

    // Appels d'initialisation basés sur la section active
    if (sectionId === 'icosahedron-interface') {
        initAndStartVisualizer('icosahedronVisualizer', initIcosahedronVisualizer, 'icosahedron-3d', 'toggle-icosahedron-animation');
    } else if (sectionId === 'cubes-interface') {
        initAndStartVisualizer('cubesVisualizer', initCubesVisualizer, 'icosahedron-3d-cubes', 'toggle-cubes-animation');
    } else if (sectionId === 'spiral-simple-interface') {
        initAndStartVisualizer('spiralSimpleVisualizer', initSpiralSimpleVisualizer, 'spiral-simple-3d', 'toggle-spiral-simple-animation');
    } else if (sectionId === 'spiral-torus-interface') {
        initAndStartVisualizer('spiralTorusVisualizer', initSpiralTorusVisualizer, 'icosahedron-3d-spiral-torus', 'toggle-spiral-torus-animation');
    } else if (sectionId === 'stream-interface') {
        initAndStartVisualizer('streamVisualizer', initStreamVisualizer, 'stream-visualizer-3d', 'start-stream-button');
    } else if (sectionId === 'torus-spring-interface') {
        initAndStartVisualizer('torusSpringVisualizer', initTorusSpringVisualizer, 'torus-spring-3d', 'toggle-torus-spring-animation');
    } else if (sectionId === 'centrifuge-laser-interface') {
        initAndStartVisualizer('centrifugeLaserVisualizer', initCentrifugeLaserVisualizer, 'centrifuge-laser-3d', 'toggle-centrifuge-laser-animation');
    } else if (sectionId === 'crypto-token-river-interface') {
        initAndStartVisualizer('cryptoTokenRiverVisualizer', initCryptoTokenRiverVisualizer, 'crypto-token-river-3d', 'toggle-crypto-token-river-animation');
    } else if (sectionId === 'centrifuge-laser-v2-interface') {
        initAndStartVisualizer('centrifugeLaserV2Visualizer', initCentrifugeLaserV2Visualizer, 'centrifuge-laser-v2-3d', 'toggle-centrifuge-laser-v2-animation');
    } else if (sectionId === 'metacube-oracle-interface') {
        initAndStartVisualizer('metaCubeOracleVisualizer', initMetaCubeOraclePlaylist, 'metacube-oracle-3d', 'toggle-metacube-oracle-animation');
    }

    // 6. Met à jour les classes 'active' des boutons de navigation
    const navButtons = [
        document.getElementById('nav-main'),
        document.getElementById('nav-icosahedron'),
        document.getElementById('nav-cubes'),
        document.getElementById('nav-spiral-simple'),
        document.getElementById('nav-spiral-torus'),
        document.getElementById('nav-stream'),
        document.getElementById('nav-internal-tool'),
        document.getElementById('nav-torus-spring'),
        document.getElementById('nav-centrifuge-laser'),
        document.getElementById('nav-crypto-token-river'),
        document.getElementById('nav-centrifuge-laser-v2'),
        document.getElementById('nav-metacube-oracle')
    ];
    navButtons.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    const activeNavButton = document.getElementById(`nav-${sectionId.replace('-interface', '')}`);
    if (activeNavButton) activeNavButton.classList.add('active');
}

// Fonction pour nettoyer complètement un visualiseur
function cleanupVisualizer(visualizer) {
    if (visualizer && typeof visualizer.stop === 'function') {
        console.log("Nettoyage du visualiseur...");
        visualizer.stop();
        if (visualizer.cleanup) {
            visualizer.cleanup();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Écouteurs d'événements pour les boutons de navigation
    const setupNavButton = (buttonId, sectionId) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => showSection(sectionId));
        } else {
            console.error(`Bouton de navigation '${buttonId}' non trouvé.`);
        }
    };

    setupNavButton('nav-main', 'main-interface');
    setupNavButton('nav-icosahedron', 'icosahedron-interface');
    setupNavButton('nav-cubes', 'cubes-interface');
    setupNavButton('nav-spiral-simple', 'spiral-simple-interface');
    setupNavButton('nav-spiral-torus', 'spiral-torus-interface');
    setupNavButton('nav-stream', 'stream-interface');
    setupNavButton('nav-internal-tool', 'internal-tool-interface');
    setupNavButton('nav-torus-spring', 'torus-spring-interface');
    setupNavButton('nav-centrifuge-laser', 'centrifuge-laser-interface');
    setupNavButton('nav-crypto-token-river', 'crypto-token-river-interface');
    setupNavButton('nav-centrifuge-laser-v2', 'centrifuge-laser-v2-interface');
    setupNavButton('nav-metacube-oracle', 'metacube-oracle-interface');

    // Gestion bouton admin
    document.getElementById('nav-admin-interface').addEventListener('click', () => {
        document.querySelectorAll('.interface-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('admin-interface').classList.remove('hidden');
    });

    // 2. Gérer les boutons Start/Stop Animation pour les visualiseurs 3D
    const setupToggleButtonForVisualizer = (buttonId, visualizerGetter, initFunc) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                let visualizer = visualizerGetter();
                if (!visualizer || typeof visualizer.isRunning !== 'function') {
                    console.warn(`Visualizer for ${buttonId} not initialized or isRunning not a function. Attempting reinitialization...`);
                    const containerId = buttonId.replace('toggle-', '').replace('-animation', '') + '-3d';
                    visualizer = initFunc(containerId);
                    if (visualizer && typeof visualizer.isRunning === 'function') {
                        if (buttonId === 'toggle-icosahedron-animation') icosahedronVisualizer = visualizer;
                        else if (buttonId === 'toggle-cubes-animation') cubesVisualizer = visualizer;
                        else if (buttonId === 'toggle-spiral-simple-animation') spiralSimpleVisualizer = visualizer;
                        else if (buttonId === 'toggle-spiral-torus-animation') spiralTorusVisualizer = visualizer;
                        else if (buttonId === 'toggle-torus-spring-animation') torusSpringVisualizer = visualizer;
                        else if (buttonId === 'toggle-centrifuge-laser-animation') centrifugeLaserVisualizer = visualizer;
                        else if (buttonId === 'toggle-crypto-token-river-animation') cryptoTokenRiverVisualizer = visualizer;
                        else if (buttonId === 'toggle-centrifuge-laser-v2-animation') centrifugeLaserV2Visualizer = visualizer;
                        else if (buttonId === 'toggle-metacube-oracle-animation') metaCubeOracleVisualizer = visualizer;
                    } else {
                        button.disabled = true;
                        button.textContent = "Erreur d'initialisation";
                        return;
                    }
                }
                if (visualizer.isRunning()) {
                    visualizer.stop();
                } else {
                    visualizer.start();
                }
                updateToggleButtonText(button, visualizer);
            });
        }
    };

    setupToggleButtonForVisualizer('toggle-icosahedron-animation', () => icosahedronVisualizer, initIcosahedronVisualizer);
    setupToggleButtonForVisualizer('toggle-cubes-animation', () => cubesVisualizer, initCubesVisualizer);
    setupToggleButtonForVisualizer('toggle-spiral-simple-animation', () => spiralSimpleVisualizer, initSpiralSimpleVisualizer);
    setupToggleButtonForVisualizer('toggle-spiral-torus-animation', () => spiralTorusVisualizer, initSpiralTorusVisualizer);
    setupToggleButtonForVisualizer('toggle-torus-spring-animation', () => torusSpringVisualizer, initTorusSpringVisualizer);
    setupToggleButtonForVisualizer('toggle-centrifuge-laser-animation', () => centrifugeLaserVisualizer, initCentrifugeLaserVisualizer);
    setupToggleButtonForVisualizer('toggle-crypto-token-river-animation', () => cryptoTokenRiverVisualizer, initCryptoTokenRiverVisualizer);
    setupToggleButtonForVisualizer('toggle-centrifuge-laser-v2-animation', () => centrifugeLaserV2Visualizer, initCentrifugeLaserV2Visualizer);
    setupToggleButtonForVisualizer('toggle-metacube-oracle-animation', () => metaCubeOracleVisualizer, initMetaCubeOraclePlaylist);

    // Initialiser les vues non-3D
    initClassicGenerator();
    initInternalTool();

    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});