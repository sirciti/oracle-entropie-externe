// frontend/navigation.js

// Importe les fonctions d'initialisation des visualiseurs 3D
import { initIcosahedronVisualizer } from './icosahedron.js';
import { initPyramidsVisualizer } from './pyramids_visualizer.js';

document.addEventListener('DOMContentLoaded', () => {
    const navMainButton = document.getElementById('nav-main');
    const navIcosahedronButton = document.getElementById('nav-icosahedron'); // Nouveau bouton pour l'icosaèdre
    const navPyramidsButton = document.getElementById('nav-pyramids');
    const navInternalToolButton = document.getElementById('nav-internal-tool');

    const mainInterfaceSection = document.getElementById('main-interface');
    const icosahedronInterfaceSection = document.getElementById('icosahedron-interface'); // Nouvelle section pour l'icosaèdre
    const pyramidsInterfaceSection = document.getElementById('pyramids-interface'); // Section des pyramides
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');

    // Pour l'Icosaèdre: Conteneur et bouton On/Off
    const icosahedron3DContainer = document.getElementById('icosahedron-3d');
    const toggleIcosahedronAnimationButton = document.getElementById('toggle-icosahedron-animation');

    // Pour les Pyramides: Conteneur et bouton On/Off
    const pyramids3DContainer = document.getElementById('icosahedron-3d-pyramids'); // Conteneur dédié aux pyramides
    const togglePyramidsAnimationButton = document.getElementById('toggle-pyramids-animation');

    // Variables pour stocker les instances des visualiseurs
    let icosahedronVisualizer = null;
    let pyramidsVisualizer = null;

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections de contenu
        if (mainInterfaceSection) mainInterfaceSection.classList.add('hidden');
        if (icosahedronInterfaceSection) icosahedronInterfaceSection.classList.add('hidden');
        if (pyramidsInterfaceSection) pyramidsInterfaceSection.classList.add('hidden');
        if (internalToolInterfaceSection) internalToolInterfaceSection.classList.add('hidden');

        // Arrêter toutes les animations 3D avant de changer
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (pyramidsVisualizer) pyramidsVisualizer.stop();
        
        // Cacher tous les conteneurs 3D par défaut
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'none';
        if (pyramids3DContainer) pyramids3DContainer.style.display = 'none';

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Initialiser et démarrer le bon visualiseur si la section est 3D
        if (sectionId === 'main-interface') {
            // Pas de 3D par défaut sur la page principale maintenant
        } else if (sectionId === 'icosahedron-interface') {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex'; // Afficher le conteneur 3D
            if (!icosahedronVisualizer) {
                // Initialiser Three.js avec un petit délai pour s'assurer que le conteneur a des dimensions
                setTimeout(() => {
                    icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d');
                    if (icosahedronVisualizer) icosahedronVisualizer.start(); // Démarrer l'animation après initialisation
                    // Mettre à jour le texte du bouton Start/Stop
                    if (toggleIcosahedronAnimationButton) toggleIcosahedronAnimationButton.textContent = "Stop Animation";
                }, 50); // Délai de 50ms pour le layout
            } else {
                if (icosahedronVisualizer) icosahedronVisualizer.start(); // Si déjà initialisé, démarrer directement
                if (toggleIcosahedronAnimationButton) toggleIcosahedronAnimationButton.textContent = "Stop Animation";
            }
        } else if (sectionId === 'pyramids-interface') {
            if (pyramids3DContainer) pyramids3DContainer.style.display = 'flex'; // Afficher le conteneur 3D des pyramides
            if (!pyramidsVisualizer) {
                // Initialiser Three.js avec un petit délai pour s'assurer que le conteneur a des dimensions
                setTimeout(() => {
                    pyramidsVisualizer = initPyramidsVisualizer('icosahedron-3d-pyramids'); // Utilise l'ID du conteneur dédié
                    if (pyramidsVisualizer) pyramidsVisualizer.start(); // Démarrer l'animation
                    // Mettre à jour le texte du bouton Start/Stop
                    if (togglePyramidsAnimationButton) togglePyramidsAnimationButton.textContent = "Stop Animation";
                }, 50); // Délai de 50ms
            } else {
                if (pyramidsVisualizer) pyramidsVisualizer.start(); // Si déjà initialisé, démarrer directement
                if (togglePyramidsAnimationButton) togglePyramidsAnimationButton.textContent = "Stop Animation";
            }
        } else { // 'internal-tool-interface'
            // Pas de 3D ici
        }

        // Mettre à jour les classes 'active' des boutons de navigation
        [navMainButton, navIcosahedronButton, navPyramidsButton, navInternalToolButton].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        document.getElementById(`nav-${sectionId.replace('-interface', '')}`).classList.add('active');
    }

    // --- Écouteurs d'événements pour les boutons de navigation ---
    if (navMainButton) navMainButton.addEventListener('click', () => showSection('main-interface'));
    else console.error("Bouton 'Générateur Aléatoire Classique' (#nav-main) non trouvé.");

    if (navIcosahedronButton) navIcosahedronButton.addEventListener('click', () => showSection('icosahedron-interface'));
    else console.error("Bouton 'Icosaèdre Dynamique' (#nav-icosahedron) non trouvé.");

    if (navPyramidsButton) navPyramidsButton.addEventListener('click', () => showSection('pyramids-interface'));
    else console.error("Bouton 'Pyramides Dynamiques' (#nav-pyramids) non trouvé.");

    if (navInternalToolButton) navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    else console.error("Bouton 'Outil Interne de Sécurité' (#nav-internal-tool) non trouvé.");


    // --- Gérer les boutons Start/Stop Animation ---
    if (toggleIcosahedronAnimationButton) {
        toggleIcosahedronAnimationButton.addEventListener('click', () => {
            if (icosahedronVisualizer) {
                if (animationId) { // animationId est global au visualiseur actif
                    icosahedronVisualizer.stop();
                    toggleIcosahedronAnimationButton.textContent = "Start Animation";
                } else {
                    icosahedronVisualizer.start();
                    toggleIcosahedronAnimationButton.textContent = "Stop Animation";
                }
            }
        });
    }

    if (togglePyramidsAnimationButton) {
        togglePyramidsAnimationButton.addEventListener('click', () => {
            if (pyramidsVisualizer) {
                if (animationId) { // animationId est global au visualiseur actif
                    pyramidsVisualizer.stop();
                    togglePyramidsAnimationButton.textContent = "Start Animation";
                } else {
                    pyramidsVisualizer.start();
                    togglePyramidsAnimationButton.textContent = "Stop Animation";
                }
            }
        });
    }


    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});
