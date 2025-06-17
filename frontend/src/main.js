// Importe les fonctions d'initialisation des visualiseurs 3D
// Importe les initialisations des vues non-3D
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
import { initIcosahedronVisualizer } from './visualizers/icosahedron_visualizer.js';
import { initSpiralTorusVisualizer } from './visualizers/spiral_torus_visualizer.js';
import { initCubesVisualizer } from './visualizers/cubes_visualizer.js';
import { initStreamVisualizer } from './visualizers/stream_visualizer.js';
import { initSpiralSimpleVisualizer } from './visualizers/spiral_simple_visualizer.js';

document.addEventListener('DOMContentLoaded', () => {
    // Boutons de navigation
    const navMainButton = document.getElementById('nav-main');
    const navIcosahedronButton = document.getElementById('nav-icosahedron');
    const navSpiralTorusButton = document.getElementById('nav-spiral_torus');
    const navCubesButton = document.getElementById('nav-cubes');
    const navStreamButton = document.getElementById('nav-stream');
    const navInternalToolButton = document.getElementById('nav-internal-tool');
    const navSpiralButton = document.getElementById('nav-spiral');
    const navSpiralSimpleButton = document.getElementById('nav-spiral-simple');

    // Sections d'interface
    const mainInterfaceSection = document.getElementById('main-interface');
    const icosahedronInterfaceSection = document.getElementById('icosahedron-interface');
    const spiralTorusInterfaceSection = document.getElementById('spiral-torus-interface');
    const cubesInterfaceSection = document.getElementById('cubes-interface');
    const streamInterfaceSection = document.getElementById('stream-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const spiralSimpleInterfaceSection = document.getElementById('spiral-simple-interface');

    // Conteneurs 3D
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const spiralTorus3DContainer = document.getElementById('icosahedron-3d-spiral-torus');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes');
    const streamVisualizer3DContainer = document.getElementById('stream-visualizer-3d');
    const spiralSimple3DContainer = document.getElementById('icosahedron-3d-spiral-simple');

    // Instances des visualiseurs
    let icosahedronVisualizer = null;
    let spiralTorusVisualizer = null;
    let cubesVisualizer = null;
    let streamVisualizer = null;
    let spiralSimpleVisualizer = null;

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections
        [
            mainInterfaceSection, icosahedronInterfaceSection, spiralTorusInterfaceSection,
            cubesInterfaceSection, streamInterfaceSection, internalToolInterfaceSection,
            spiralSimpleInterfaceSection
        ].forEach(section => {
            if (section) section.classList.add('hidden');
        });

        // Arrêter toutes les animations 3D
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (spiralTorusVisualizer) spiralTorusVisualizer.stop();
        if (cubesVisualizer) cubesVisualizer.stop();
        if (streamVisualizer) streamVisualizer.stop();
        if (spiralSimpleVisualizer) spiralSimpleVisualizer.stop();

        // Gérer la visibilité des conteneurs 3D
        [
            icosahedron3DContainer, spiralTorus3DContainer, cubes3DContainer,
            streamVisualizer3DContainer, spiralSimple3DContainer
        ].forEach(container => {
            if (container) container.style.display = 'none';
        });

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
        } else if (sectionId === 'spiral-torus-interface') {
            if (spiralTorus3DContainer) spiralTorus3DContainer.style.display = 'flex';
            if (!spiralTorusVisualizer) {
                setTimeout(() => {
                    spiralTorusVisualizer = initSpiralTorusVisualizer('icosahedron-3d-spiral-torus');
                    if (spiralTorusVisualizer) spiralTorusVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-spiral-torus-animation');
                    if (toggleBtn) toggleBtn.textContent = spiralTorusVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 50);
            } else {
                if (spiralTorusVisualizer) spiralTorusVisualizer.start();
                const toggleBtn = document.getElementById('toggle-spiral-torus-animation');
                if (toggleBtn) toggleBtn.textContent = spiralTorusVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
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
        } else if (sectionId === 'spiral-simple-interface') {
            if (spiralSimple3DContainer) spiralSimple3DContainer.style.display = 'flex';
            if (!spiralSimpleVisualizer) {
                setTimeout(() => {
                    spiralSimpleVisualizer = initSpiralSimpleVisualizer('icosahedron-3d-spiral-simple');
                    if (spiralSimpleVisualizer) spiralSimpleVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-spiral-simple-animation');
                    if (toggleBtn) toggleBtn.textContent = spiralSimpleVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
                }, 50);
            } else {
                if (spiralSimpleVisualizer) spiralSimpleVisualizer.start();
                const toggleBtn = document.getElementById('toggle-spiral-simple-animation');
                if (toggleBtn) toggleBtn.textContent = spiralSimpleVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        }

        // Mettre à jour les classes 'active' des boutons
        [
            navMainButton, navIcosahedronButton, navSpiralTorusButton, navCubesButton,
            navStreamButton, navInternalToolButton, navSpiralButton, navSpiralSimpleButton
        ].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        const navBtn = document.getElementById(`nav-${sectionId.replace('-interface', '')}`);
        if (navBtn) navBtn.classList.add('active');
    }

    // Écouteurs d'événements pour les boutons de navigation
    if (navMainButton) navMainButton.addEventListener('click', () => showSection('main-interface'));
    else console.error("Bouton de navigation 'Générateur Aléatoire Classique' (#nav-main) non trouvé.");

    if (navIcosahedronButton) navIcosahedronButton.addEventListener('click', () => showSection('icosahedron-interface'));
    else console.error("Bouton de navigation 'Icosaèdre Dynamique' (#nav-icosahedron) non trouvé.");

    if (navSpiralTorusButton) navSpiralTorusButton.addEventListener('click', () => showSection('spiral-torus-interface'));
    else console.error("Bouton de navigation 'Spirale Toroïdale' (#nav-spiral_torus) non trouvé.");

    if (navCubesButton) navCubesButton.addEventListener('click', () => showSection('cubes-interface'));
    else console.error("Bouton de navigation 'Cubes Dynamiques' (#nav-cubes) non trouvé.");

    if (navStreamButton) navStreamButton.addEventListener('click', () => showSection('stream-interface'));
    else console.error("Bouton de navigation 'Flux de Tokens' (#nav-stream) non trouvé.");

    if (navInternalToolButton) navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    else console.error("Bouton de navigation 'Outil Interne de Sécurité' (#nav-internal-tool) non trouvé.");

    if (navSpiralButton) navSpiralButton.addEventListener('click', () => showSection('spiral-simple-interface'));
    else {
        const newSpiralButton = document.createElement('button');
        newSpiralButton.id = 'nav-spiral';
        newSpiralButton.className = 'nav-button';
        newSpiralButton.textContent = 'Spirale Dynamique';
        document.querySelector('.navigation').appendChild(newSpiralButton);
        newSpiralButton.addEventListener('click', () => showSection('spiral-simple-interface'));
    }

    if (navSpiralSimpleButton) navSpiralSimpleButton.addEventListener('click', () => showSection('spiral-simple-interface'));
    else console.error("Bouton de navigation 'Spirale Simple' (#nav-spiral-simple) non trouvé.");

    // Gérer les boutons Start/Stop Animation
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

    const toggleSpiralTorusAnimationButton = document.getElementById('toggle-spiral-torus-animation');
    if (toggleSpiralTorusAnimationButton) {
        toggleSpiralTorusAnimationButton.addEventListener('click', () => {
            if (spiralTorusVisualizer) {
                if (spiralTorusVisualizer.isRunning()) {
                    spiralTorusVisualizer.stop();
                } else {
                    spiralTorusVisualizer.start();
                }
                toggleSpiralTorusAnimationButton.textContent = spiralTorusVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                console.warn("Spiral Torus visualizer not initialized for toggle button.");
            }
        });
    }

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

    const toggleSpiralSimpleAnimationButton = document.getElementById('toggle-spiral-simple-animation');
    if (toggleSpiralSimpleAnimationButton) {
        toggleSpiralSimpleAnimationButton.addEventListener('click', () => {
            if (spiralSimpleVisualizer) {
                if (spiralSimpleVisualizer.isRunning()) {
                    spiralSimpleVisualizer.stop();
                } else {
                    spiralSimpleVisualizer.start();
                }
                toggleSpiralSimpleAnimationButton.textContent = spiralSimpleVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            } else {
                spiralSimpleVisualizer = initSpiralSimpleVisualizer('icosahedron-3d-spiral-simple');
                if (spiralSimpleVisualizer) spiralSimpleVisualizer.start();
                toggleSpiralSimpleAnimationButton.textContent = spiralSimpleVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
            }
        });
    }

    // Initialiser les vues non-3D
    initClassicGenerator();
    initInternalTool();

    // Afficher la section principale par défaut
    showSection('main-interface');
});

// Exposer showSection globalement
