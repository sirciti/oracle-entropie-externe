// Importe les fonctions d'initialisation des visualiseurs 3D
import './styles/style.css';
// Importe les initialisations des vues non-3D
import { initClassicGenerator } from './views/classic_generator.js';
import { initInternalTool } from './views/internal_tool.js';
import { initIcosahedronVisualizer } from './visualizers/icosahedron_visualizer.js';
import { initSpiralTorusVisualizer } from './visualizers/spiral_torus_visualizer.js';
import { initCubesVisualizer } from './visualizers/cubes_visualizer.js';
import { initStreamVisualizer } from './visualizers/stream_visualizer.js';

document.addEventListener('DOMContentLoaded', () => {
    function showSection(sectionId) {
        document.querySelectorAll('.interface-section').forEach(section => {
            section.style.display = 'none';
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            console.log('Section affichée:', sectionId, 'Classes:', section.classList);
        } else {
            console.error('Section non trouvée:', sectionId);
        }
    }

    // Boutons de navigation
    const navMainButton = document.getElementById('nav-main');
    const navIcosahedronButton = document.getElementById('nav-icosahedron');
    const navSpiralTorusButton = document.getElementById('nav-spiral_torus');
    const navCubesButton = document.getElementById('nav-cubes');
    const navStreamButton = document.getElementById('nav-stream');
    const navInternalToolButton = document.getElementById('nav-internal-tool');

    // Conteneurs 3D
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const spiralTorus3DContainer = document.getElementById('icosahedron-3d-spiral-torus');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes');
    const streamVisualizer3DContainer = document.getElementById('stream-visualizer-3d');

    // Instances des visualiseurs
    let icosahedronVisualizer = null;
    let spiralTorusVisualizer = null;
    let cubesVisualizer = null;
    let streamVisualizer = null;

    // Navigation
    if (navMainButton) navMainButton.addEventListener('click', () => showSection('main-interface'));
    if (navIcosahedronButton) navIcosahedronButton.addEventListener('click', () => showSection('icosahedron-interface'));
    if (navSpiralTorusButton) navSpiralTorusButton.addEventListener('click', () => showSection('spiral-torus-interface'));
    if (navCubesButton) navCubesButton.addEventListener('click', () => showSection('cubes-interface'));
    if (navStreamButton) navStreamButton.addEventListener('click', () => showSection('stream-interface'));
    if (navInternalToolButton) navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));

    // Animation buttons
    const toggleIcosahedronAnimationButton = document.getElementById('toggle-icosahedron-animation');
    if (toggleIcosahedronAnimationButton) {
        toggleIcosahedronAnimationButton.addEventListener('click', () => {
            if (!icosahedronVisualizer) {
                icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d');
                icosahedronVisualizer.start();
            } else {
                if (icosahedronVisualizer.isRunning()) {
                    icosahedronVisualizer.stop();
                } else {
                    icosahedronVisualizer.start();
                }
            }
            toggleIcosahedronAnimationButton.textContent = icosahedronVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
        });
    }

    const toggleSpiralTorusAnimationButton = document.getElementById('toggle-spiral-torus-animation');
    if (toggleSpiralTorusAnimationButton) {
        toggleSpiralTorusAnimationButton.addEventListener('click', () => {
            if (!spiralTorusVisualizer) {
                spiralTorusVisualizer = initSpiralTorusVisualizer('icosahedron-3d-spiral-torus');
                spiralTorusVisualizer.start();
            } else {
                if (spiralTorusVisualizer.isRunning()) {
                    spiralTorusVisualizer.stop();
                } else {
                    spiralTorusVisualizer.start();
                }
            }
            toggleSpiralTorusAnimationButton.textContent = spiralTorusVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
        });
    }

    const toggleCubesAnimationButton = document.getElementById('toggle-cubes-animation');
    if (toggleCubesAnimationButton) {
        toggleCubesAnimationButton.addEventListener('click', () => {
            if (!cubesVisualizer) {
                cubesVisualizer = initCubesVisualizer('icosahedron-3d-cubes');
                cubesVisualizer.start();
            } else {
                if (cubesVisualizer.isRunning()) {
                    cubesVisualizer.stop();
                } else {
                    cubesVisualizer.start();
                }
            }
            toggleCubesAnimationButton.textContent = cubesVisualizer.isRunning() ? "Stop Animation" : "Start Animation";
        });
    }

    // Initialiser les vues non-3D
    initClassicGenerator();
    initInternalTool();

    // Afficher la section principale par défaut
    showSection('main-interface');
    window.showSection = showSection;
});

// Exposer showSection globalement
