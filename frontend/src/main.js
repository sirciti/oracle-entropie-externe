// Importe les fonctions d'initialisation des visualiseurs 3D
// Importe les initialisations des vues non-3D
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
import { initIcosahedronVisualizer } from './visualizers/icosahedron.js';
import { initPyramidsVisualizer } from './visualizers/pyramids_visualizer.js';
import { initCubesVisualizer } from './visualizers/cubes_visualizer.js';
import { initStreamVisualizer } from './visualizers/stream_visualizer.js';
import { initSpiralVisualizer } from './visualizers/spiral_visualizer.js';
document.addEventListener('DOMContentLoaded', () => {
    // Boutons de navigation
    const navMainButton = document.getElementById('nav-main');
    const navIcosahedronButton = document.getElementById('nav-icosahedron');
    const navPyramidsButton = document.getElementById('nav-pyramids');
    const navCubesButton = document.getElementById('nav-cubes');
    const navStreamButton = document.getElementById('nav-stream');
    const navInternalToolButton = document.getElementById('nav-internal-tool');
    const navSpiralButton = document.getElementById('nav-spiral'); // Nouveau bouton pour la spirale

    // Sections d'interface
    const mainInterfaceSection = document.getElementById('main-interface');
    const icosahedronInterfaceSection = document.getElementById('icosahedron-interface');
    const pyramidsInterfaceSection = document.getElementById('pyramids-interface');
    const cubesInterfaceSection = document.getElementById('cubes-interface');
    const streamInterfaceSection = document.getElementById('stream-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const spiralInterfaceSection = document.getElementById('spiral-interface'); // Nouvelle section pour la spirale

    // Conteneurs 3D
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const pyramids3DContainer = document.getElementById('icosahedron-3d-pyramids');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes');
    const streamVisualizer3DContainer = document.getElementById('stream-visualizer-3d');
    const spiral3DContainer = document.getElementById('spiral-3d'); // Nouveau conteneur pour la spirale

    // Instances des visualiseurs
    let icosahedronVisualizer = null;
    let pyramidsVisualizer = null;
    let cubesVisualizer = null;
    let streamVisualizer = null;
    let spiralVisualizer = null; // Nouvelle instance pour la spirale

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections
        if (mainInterfaceSection) mainInterfaceSection.classList.add('hidden');
        if (icosahedronInterfaceSection) icosahedronInterfaceSection.classList.add('hidden');
        if (pyramidsInterfaceSection) pyramidsInterfaceSection.classList.add('hidden');
        if (cubesInterfaceSection) cubesInterfaceSection.classList.add('hidden');
        if (streamInterfaceSection) streamInterfaceSection.classList.add('hidden');
        if (internalToolInterfaceSection) internalToolInterfaceSection.classList.add('hidden');
        if (spiralInterfaceSection) spiralInterfaceSection.classList.add('hidden');

        // Arrêter toutes les animations 3D
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (pyramidsVisualizer) pyramidsVisualizer.stop();
        if (cubesVisualizer) cubesVisualizer.stop();
        if (streamVisualizer) streamVisualizer.stop();
        if (spiralVisualizer) spiralVisualizer.stop();

        // Gérer la visibilité des conteneurs 3D
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'none';
        if (pyramids3DContainer) pyramids3DContainer.style.display = 'none';
        if (cubes3DContainer) cubes3DContainer.style.display = 'none';
        if (streamVisualizer3DContainer) streamVisualizer3DContainer.style.display = 'none';
        if (spiral3DContainer) spiral3DContainer.style.display = 'none';

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Initialiser et démarrer le visualiseur correspondant
        if (sectionId === 'icosahedron-interface') {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex';
            if (!icosahedronVisualizer) {
                setTimeout(() => {
                    icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d');
                    if (icosahedronVisualizer) icosahedronVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-icosahedron-animation');
                    if (toggleBtn) toggleBtn.textContent = icosahedronVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 50);
            } else {
                if (icosahedronVisualizer) icosahedronVisualizer.start();
                const toggleBtn = document.getElementById('toggle-icosahedron-animation');
                if (toggleBtn) toggleBtn.textContent = icosahedronVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        } else if (sectionId === 'pyramids-interface') {
            if (pyramids3DContainer) pyramids3DContainer.style.display = 'flex';
            if (!pyramidsVisualizer) {
                setTimeout(() => {
                    pyramidsVisualizer = initPyramidsVisualizer('icosahedron-3d-pyramids');
                    if (pyramidsVisualizer) pyramidsVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-pyramids-animation');
                    if (toggleBtn) toggleBtn.textContent = pyramidsVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 50);
            } else {
                if (pyramidsVisualizer) pyramidsVisualizer.start();
                const toggleBtn = document.getElementById('toggle-pyramids-animation');
                if (toggleBtn) toggleBtn.textContent = pyramidsVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        } else if (sectionId === 'cubes-interface') {
            if (cubes3DContainer) cubes3DContainer.style.display = 'flex';
            if (!cubesVisualizer) {
                setTimeout(() => {
                    cubesVisualizer = initCubesVisualizer('icosahedron-3d-cubes');
                    if (cubesVisualizer) cubesVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-cubes-animation');
                    if (toggleBtn) toggleBtn.textContent = cubesVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 50);
            } else {
                if (cubesVisualizer) cubesVisualizer.start();
                const toggleBtn = document.getElementById('toggle-cubes-animation');
                if (toggleBtn) toggleBtn.textContent = cubesVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        } else if (sectionId === 'stream-interface') {
            if (streamVisualizer3DContainer) streamVisualizer3DContainer.style.display = 'flex';
            if (!streamVisualizer) {
                setTimeout(() => {
                    streamVisualizer = initStreamVisualizer('stream-visualizer-3d');
                }, 50);
            }
        } else if (sectionId === 'spiral-interface') {
            if (spiral3DContainer) spiral3DContainer.style.display = 'flex';
            if (!spiralVisualizer) {
                setTimeout(() => {
                    spiralVisualizer = initSpiralVisualizer('spiral-3d');
                    if (spiralVisualizer) spiralVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-spiral-animation');
                    if (toggleBtn) toggleBtn.textContent = spiralVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 100);
            } else {
                if (spiralVisualizer) spiralVisualizer.start();
                const toggleBtn = document.getElementById('toggle-spiral-animation');
                if (toggleBtn) toggleBtn.textContent = spiralVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        }

        // Mettre à jour les classes 'active' des boutons
        [navMainButton, navIcosahedronButton, navPyramidsButton, navCubesButton, navStreamButton, navInternalToolButton, navSpiralButton].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        document.getElementById(`nav-${sectionId.replace('-interface', '')}`).classList.add('active');
    }

    // --- Écouteurs d'événements pour les boutons de navigation ---
    if (navMainButton) navMainButton.addEventListener('click', () => showSection('main-interface'));
    else console.error("Bouton de navigation 'Générateur Aléatoire Classique' (#nav-main) non trouvé.");

    if (navIcosahedronButton) navIcosahedronButton.addEventListener('click', () => showSection('icosahedron-interface'));
    else console.error("Bouton de navigation 'Icosaèdre Dynamique' (#nav-icosahedron) non trouvé.");

    if (navPyramidsButton) navPyramidsButton.addEventListener('click', () => showSection('pyramids-interface'));
    else console.error("Bouton de navigation 'Pyramides Dynamiques' (#nav-pyramids) non trouvé.");

    if (navCubesButton) navCubesButton.addEventListener('click', () => showSection('cubes-interface'));
    else console.error("Bouton de navigation 'Cubes Dynamiques' (#nav-cubes) non trouvé.");

    if (navStreamButton) navStreamButton.addEventListener('click', () => showSection('stream-interface'));
    else console.error("Bouton de navigation 'Flux de Tokens' (#nav-stream) non trouvé.");

    if (navInternalToolButton) navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    else console.error("Bouton de navigation 'Outil Interne de Sécurité' (#nav-internal-tool) non trouvé.");

    if (navSpiralButton) navSpiralButton.addEventListener('click', () => showSection('spiral-interface'));
    else {
        // Créer dynamiquement le bouton si non présent dans index.html
        const newSpiralButton = document.createElement('button');
        newSpiralButton.id = 'nav-spiral';
        newSpiralButton.className = 'nav-button';
        newSpiralButton.textContent = 'Spirale Dynamique';
        document.querySelector('.navigation').appendChild(newSpiralButton);
        newSpiralButton.addEventListener('click', () => showSection('spiral-interface'));
    }

    // --- Gérer les boutons Start/Stop Animation ---
    // Icosaèdre
    const toggleIcosahedronAnimationButton = document.getElementById('toggle-icosahedron-animation');
    if (toggleIcosahedronAnimationButton) {
        toggleIcosahedronAnimationButton.addEventListener('click', () => {
            if (icosahedronVisualizer) {
                if (icosahedronVisualizer.isRunning()) {
                    icosahedronVisualizer.stop();
                } else {
                    icosahedronVisualizer.start();
                }
                toggleIcosahedronAnimationButton.textContent = icosahedronVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                console.warn("Icosahedron visualizer not initialized for toggle button.");
            }
        });
    }

    // Pyramides
    const togglePyramidsAnimationButton = document.getElementById('toggle-pyramids-animation');
    if (togglePyramidsAnimationButton) {
        togglePyramidsAnimationButton.addEventListener('click', () => {
            if (pyramidsVisualizer) {
                if (pyramidsVisualizer.isRunning()) {
                    pyramidsVisualizer.stop();
                } else {
                    pyramidsVisualizer.start();
                }
                togglePyramidsAnimationButton.textContent = pyramidsVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                console.warn("Pyramids visualizer not initialized for toggle button.");
            }
        });
    }

    // Cubes
    const toggleCubesAnimationButton = document.getElementById('toggle-cubes-animation');
    if (toggleCubesAnimationButton) {
        toggleCubesAnimationButton.addEventListener('click', () => {
            if (cubesVisualizer) {
                if (cubesVisualizer.isRunning()) {
                    cubesVisualizer.stop();
                } else {
                    cubesVisualizer.start();
                }
                toggleCubesAnimationButton.textContent = cubesVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                console.warn("Cubes visualizer not initialized for toggle button.");
            }
        });
    }

    // Spirale
    const toggleSpiralAnimationButton = document.getElementById('toggle-spiral-animation');
    if (toggleSpiralAnimationButton) {
        toggleSpiralAnimationButton.addEventListener('click', () => {
            if (spiralVisualizer) {
                if (spiralVisualizer.isRunning()) {
                    spiralVisualizer.stop();
                } else {
                    spiralVisualizer.start();
                }
                toggleSpiralAnimationButton.textContent = spiralVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                console.warn("Spiral visualizer not initialized for toggle button.");
            }
        });
    }

    // Initialiser les vues non-3D
    initClassicGenerator();
    initInternalTool();

    // Afficher la section principale par défaut
    showSection('main-interface');
});