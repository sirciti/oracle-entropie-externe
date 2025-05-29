// frontend/navigation.js

// Importe les fonctions d'initialisation des visualiseurs 3D
import { initIcosahedronVisualizer } from './icosahedron.js';
import { initPyramidsVisualizer } from './pyramids_visualizer.js';
import { initCubesVisualizer } from './cubes_visualizer.js'; // <-- NOUVEL IMPORT

document.addEventListener('DOMContentLoaded', () => {
    const navMainButton = document.getElementById('nav-main');
    const navIcosahedronButton = document.getElementById('nav-icosahedron');
    const navPyramidsButton = document.getElementById('nav-pyramids');
    const navCubesButton = document.getElementById('nav-cubes'); // <-- NOUVEAU BOUTON
    const navInternalToolButton = document.getElementById('nav-internal-tool');

    const mainInterfaceSection = document.getElementById('main-interface');
    const icosahedronInterfaceSection = document.getElementById('icosahedron-interface');
    const pyramidsInterfaceSection = document.getElementById('pyramids-interface');
    const cubesInterfaceSection = document.getElementById('cubes-interface'); // <-- NOUVELLE SECTION
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');

    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const pyramids3DContainer = document.getElementById('icosahedron-3d-pyramids');
    const cubes3DContainer = document.getElementById('icosahedron-3d-cubes'); // <-- NOUVEAU CONTENEUR 3D

    let icosahedronVisualizer = null;
    let pyramidsVisualizer = null;
    let cubesVisualizer = null; // <-- NOUVELLE INSTANCE DE VISUALIZER

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections de contenu
        if (mainInterfaceSection) mainInterfaceSection.classList.add('hidden');
        if (icosahedronInterfaceSection) icosahedronInterfaceSection.classList.add('hidden');
        if (pyramidsInterfaceSection) pyramidsInterfaceSection.classList.add('hidden');
        if (cubesInterfaceSection) cubesInterfaceSection.classList.add('hidden'); // <-- CACHER LA NOUVELLE SECTION
        if (internalToolInterfaceSection) internalToolInterfaceSection.classList.add('hidden');

        // Arrêter toutes les animations 3D avant de changer
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (pyramidsVisualizer) pyramidsVisualizer.stop();
        if (cubesVisualizer) cubesVisualizer.stop(); // <-- ARRÊTER LA NOUVELLE ANIMATION
        
        // Gérer la visibilité des conteneurs 3D
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'none';
        if (pyramids3DContainer) pyramids3DContainer.style.display = 'none';
        if (cubes3DContainer) cubes3DContainer.style.display = 'none'; // <-- CACHER LE NOUVEAU CONTENEUR 3D


        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Initialiser et démarrer le bon visualiseur si la section est 3D
        if (sectionId === 'icosahedron-interface') {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex';
            if (!icosahedronVisualizer) {
                setTimeout(() => {
                    icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d');
                    if (icosahedronVisualizer) icosahedronVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-icosahedron-animation');
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                if (icosahedronVisualizer) icosahedronVisualizer.start();
                const toggleBtn = document.getElementById('toggle-icosahedron-animation');
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        } else if (sectionId === 'pyramids-interface') {
            if (pyramids3DContainer) pyramids3DContainer.style.display = 'flex';
            if (!pyramidsVisualizer) {
                setTimeout(() => {
                    pyramidsVisualizer = initPyramidsVisualizer('icosahedron-3d-pyramids');
                    if (pyramidsVisualizer) pyramidsVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-pyramids-animation');
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                if (pyramidsVisualizer) pyramidsVisualizer.start();
                const toggleBtn = document.getElementById('toggle-pyramids-animation');
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        } else if (sectionId === 'cubes-interface') { // <-- NOUVELLE LOGIQUE POUR LES CUBES
            if (cubes3DContainer) cubes3DContainer.style.display = 'flex';
            if (!cubesVisualizer) {
                setTimeout(() => {
                    cubesVisualizer = initCubesVisualizer('icosahedron-3d-cubes'); // Utilise l'ID du conteneur des cubes
                    if (cubesVisualizer) cubesVisualizer.start();
                    const toggleBtn = document.getElementById('toggle-cubes-animation');
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                if (cubesVisualizer) cubesVisualizer.start();
                const toggleBtn = document.getElementById('toggle-cubes-animation');
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        } else { // 'main-interface' ou 'internal-tool-interface'
            // Pas de 3D ici
        }

        // Mettre à jour les classes 'active' des boutons de navigation
        [navMainButton, navIcosahedronButton, navPyramidsButton, navCubesButton, navInternalToolButton].forEach(btn => { // <-- INCLURE NOUVEAU BOUTON
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
    
    if (navCubesButton) navCubesButton.addEventListener('click', () => showSection('cubes-interface')); // <-- NOUVEL ÉCOUTEUR
    else console.error("Bouton de navigation 'Cubes Dynamiques' (#nav-cubes) non trouvé.");

    if (navInternalToolButton) navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    else console.error("Bouton de navigation 'Outil Interne de Sécurité' (#nav-internal-tool) non trouvé.");


    // --- Gérer les boutons Start/Stop Animation ---
    // Icosaèdre
    const toggleIcosahedronAnimationButton = document.getElementById('toggle-icosahedron-animation');
    if (toggleIcosahedronAnimationButton) {
        toggleIcosahedronAnimationButton.addEventListener('click', () => {
            if (icosahedronVisualizer) {
                if (icosahedronVisualizer.isRunning) {
                    icosahedronVisualizer.stop();
                    toggleIcosahedronAnimationButton.textContent = "Start Animation";
                } else {
                    icosahedronVisualizer.start();
                    toggleIcosahedronAnimationButton.textContent = "Stop Animation";
                }
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
                if (pyramidsVisualizer.isRunning) {
                    pyramidsVisualizer.stop();
                    togglePyramidsAnimationButton.textContent = "Start Animation";
                } else {
                    pyramidsVisualizer.start();
                    togglePyramidsAnimationButton.textContent = "Stop Animation";
                }
            } else {
                console.warn("Pyramids visualizer not initialized for toggle button.");
            }
        });
    }

    // Cubes (NOUVEAU BOUTON ON/OFF)
    const toggleCubesAnimationButton = document.getElementById('toggle-cubes-animation');
    if (toggleCubesAnimationButton) {
        toggleCubesAnimationButton.addEventListener('click', () => {
            if (cubesVisualizer) {
                if (cubesVisualizer.isRunning) {
                    cubesVisualizer.stop();
                    toggleCubesAnimationButton.textContent = "Start Animation";
                } else {
                    cubesVisualizer.start();
                    toggleCubesAnimationButton.textContent = "Stop Animation";
                }
            } else {
                console.warn("Cubes visualizer not initialized for toggle button.");
            }
        });
    }


    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});