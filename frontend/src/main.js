// frontend/src/main.js

// Importe les fonctions d'initialisation des visualiseurs et des vues non-3D
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
import { initIcosahedronVisualizer } from './visualizers/icosahedron_visualizer.js';
import { initCubesVisualizer } from './visualizers/cubes_visualizer.js';
import { initSpiralSimpleVisualizer } from './visualizers/spiral_simple_visualizer.js';
import { initSpiralTorusVisualizer } from './visualizers/spiral_torus_visualizer.js';
import { initStreamVisualizer } from './visualizers/stream_visualizer.js';
import { initTorusSpringVisualizer } from './visualizers/torus_spring_visualizer.js';
import { initCentrifugeLaserVisualizer } from './visualizers/centrifuge_laser_visualizer.js'; // Ajout import

// Déclarer les variables globales en haut du fichier
let icosahedronVisualizer = null;
let cubesVisualizer = null;
let spiralSimpleVisualizer = null;
let spiralTorusVisualizer = null;
let streamVisualizer = null;
let torusSpringVisualizer = null;
let centrifugeLaserVisualizer = null; // Ajout variable globale

// Fonction d'aide pour gérer le texte des boutons Start/Stop
function updateToggleButtonText(buttonElement, visualizerInstance) {
    if (buttonElement && visualizerInstance) {
        buttonElement.textContent = visualizerInstance.isRunning() ? "Stop Animation" : "Start Animation";
    }
}

// Fonction principale pour afficher une section et cacher/initialiser les autres
function showSection(sectionId) {
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

    // 2. Cache toutes les sections et arrête les animations des visualiseurs
    const allSections = [
    mainInterfaceSection, icosahedronInterfaceSection, cubesInterfaceSection,
    spiralSimpleInterfaceSection, spiralTorusInterfaceSection,
    streamInterfaceSection, internalToolInterfaceSection, torusSpringInterfaceSection,
    document.getElementById('centrifuge-laser-interface')
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
    cleanupVisualizer(centrifugeLaserVisualizer); // Ajout nettoyage

    icosahedronVisualizer = null;
    cubesVisualizer = null;
    spiralSimpleVisualizer = null;
    spiralTorusVisualizer = null;
    streamVisualizer = null;
    torusSpringVisualizer = null;
    centrifugeLaserVisualizer = null; // Ajout reset

    // 3. Gère la visibilité des conteneurs 3D
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes');
    const spiralSimple3DContainer = document.getElementById('icosahedron-3d-spiral-simple');
    const spiralTorus3DContainer = document.getElementById('icosahedron-3d-spiral-torus');
    const streamVisualizer3DContainer = document.getElementById('stream-visualizer-3d');
    const torusSpring3DContainer = document.getElementById('torus-spring-3d');

    const all3DContainers = [
        icosahedron3DContainer, cubes3DContainer,
        spiralSimple3DContainer, spiralTorus3DContainer, streamVisualizer3DContainer,
        torusSpring3DContainer
    ];
    all3DContainers.forEach(container => {
        if (container) {
            container.style.display = 'none';
            // Vider complètement le conteneur
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
    const initAndStartVisualizer = (visualizerName, initFunc, containerId, toggleBtnId) => {
        const containerElement = document.getElementById(containerId);
        const toggleButtonElement = document.getElementById(toggleBtnId);

        if (containerElement) containerElement.style.display = 'flex';

        // Nettoyage
        if (visualizerName === 'icosahedronVisualizer' && icosahedronVisualizer) {
            icosahedronVisualizer.stop();
            icosahedronVisualizer = null;
        }
        if (visualizerName === 'cubesVisualizer' && cubesVisualizer) {
            cubesVisualizer.stop();
            cubesVisualizer = null;
        }
        if (visualizerName === 'spiralSimpleVisualizer' && spiralSimpleVisualizer) {
            spiralSimpleVisualizer.stop();
            spiralSimpleVisualizer = null;
        }
        if (visualizerName === 'spiralTorusVisualizer' && spiralTorusVisualizer) {
            spiralTorusVisualizer.stop();
            spiralTorusVisualizer = null;
        }
        if (visualizerName === 'streamVisualizer' && streamVisualizer) {
            streamVisualizer.stop();
            streamVisualizer = null;
        }
        if (visualizerName === 'torusSpringVisualizer' && torusSpringVisualizer) {
            torusSpringVisualizer.stop();
            torusSpringVisualizer = null;
        }
        if (visualizerName === 'centrifugeLaserVisualizer' && centrifugeLaserVisualizer) {
            centrifugeLaserVisualizer.stop();
            centrifugeLaserVisualizer = null;
        }

        setTimeout(() => {
            if (containerElement && containerElement.clientWidth > 0 && containerElement.clientHeight > 0) {
                let visualizerInstance = null;
                if (visualizerName === 'icosahedronVisualizer') visualizerInstance = icosahedronVisualizer = initFunc(containerId);
                else if (visualizerName === 'cubesVisualizer') visualizerInstance = cubesVisualizer = initFunc(containerId);
                else if (visualizerName === 'spiralSimpleVisualizer') visualizerInstance = spiralSimpleVisualizer = initFunc(containerId);
                else if (visualizerName === 'spiralTorusVisualizer') visualizerInstance = spiralTorusVisualizer = initFunc(containerId);
                else if (visualizerName === 'streamVisualizer') visualizerInstance = streamVisualizer = initFunc(containerId);
                else if (visualizerName === 'torusSpringVisualizer') visualizerInstance = torusSpringVisualizer = initFunc(containerId);
                else if (visualizerName === 'centrifugeLaserVisualizer') visualizerInstance = centrifugeLaserVisualizer = initFunc(containerId);

                if (visualizerInstance && initFunc !== initStreamVisualizer) {
                    visualizerInstance.start();
                }
                updateToggleButtonText(toggleButtonElement, visualizerInstance);
            } else {
                console.warn(`Initialisation différée pour ${containerId}: dimensions non prêtes. Réessai...`);
                setTimeout(() => initAndStartVisualizer(visualizerName, initFunc, containerId, toggleBtnId), 100);
            }
        }, 50);
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
    } else if (sectionId === 'centrifuge-laser-interface') { // Ajout du cas centrifuge-laser
        initAndStartVisualizer('centrifugeLaserVisualizer', initCentrifugeLaserVisualizer, 'centrifuge-laser-3d', 'toggle-centrifuge-laser-animation');
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
    document.getElementById('nav-centrifuge-laser') // Ajout du bouton centrifuge-laser
];
    navButtons.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });
    const activeNavButton = document.getElementById(`nav-${sectionId.replace('-interface', '')}`);
    if (activeNavButton) activeNavButton.classList.add('active');
}

// Fonction pour nettoyer complètement un visualiseur
function cleanupVisualizer(visualizer) {
    if (visualizer) {
        console.log("Nettoyage du visualiseur...");
        visualizer.stop();
        if (visualizer.cleanup) {
            visualizer.cleanup();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Écouteurs d'événements pour les boutons de navigation (sélection des sections)
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

    // 1. Ajouter après les autres boutons de navigation
    const navTorusSpringButton = document.getElementById('nav-torus-spring');
    if (navTorusSpringButton) {
        navTorusSpringButton.addEventListener('click', () => showSection('torus-spring-interface'));
    } else {
        console.warn("Bouton de navigation 'nav-torus-spring' non trouvé.");
    }

    // Ajout event listener pour le bouton centrifuge laser
    const navCentrifugeLaserButton = document.getElementById('nav-centrifuge-laser');
    if (navCentrifugeLaserButton) {
        navCentrifugeLaserButton.addEventListener('click', () => showSection('centrifuge-laser-interface'));
    }

    // 2. Gérer les boutons Start/Stop Animation pour les visualiseurs 3D (définis dans showSection)
    const setupToggleButtonForVisualizer = (buttonId, visualizerGetter) => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const visualizer = visualizerGetter();
                if (visualizer) {
                    if (visualizer.isRunning()) {
                        visualizer.stop();
                    } else {
                        visualizer.start();
                    }
                    updateToggleButtonText(button, visualizer);
                } else {
                    console.warn(`Visualizer for ${buttonId} not initialized.`);
                }
            });
        }
    };

    // Initialiser le visualiseur Icosahedron AVANT d'attacher le listener
    // (optionnel si tu utilises showSection pour l'initialisation dynamique)
    // icosahedronVisualizer = initIcosahedronVisualizer('container-icosahedron');

    // Attacher le listener sur le bouton toggle
    setupToggleButtonForVisualizer('toggle-icosahedron-animation', () => icosahedronVisualizer);

    setupToggleButtonForVisualizer('toggle-cubes-animation', () => cubesVisualizer);
    setupToggleButtonForVisualizer('toggle-spiral-simple-animation', () => spiralSimpleVisualizer);
    setupToggleButtonForVisualizer('toggle-spiral-torus-animation', () => spiralTorusVisualizer);
    setupToggleButtonForVisualizer('toggle-torus-spring-animation', () => torusSpringVisualizer);
    setupToggleButtonForVisualizer('toggle-centrifuge-laser-animation', () => centrifugeLaserVisualizer);

    // Initialiser les vues non-3D
    initClassicGenerator();
    initInternalTool();

    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});