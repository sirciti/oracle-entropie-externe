// frontend/navigation.js

// Importe les fonctions d'initialisation des visualiseurs 3D
import { initIcosahedronVisualizer } from './icosahedron.js'; // Assurez-vous que icosahedron.js exporte cette fonction
import { initPyramidsVisualizer } from './pyramids_visualizer.js'; // Nouvelle fonction pour les pyramides

document.addEventListener('DOMContentLoaded', () => {
    const navMainButton = document.getElementById('nav-main');
    const navInternalToolButton = document.getElementById('nav-internal-tool');
    const navPyramidsButton = document.getElementById('nav-pyramids'); // Nouveau bouton pour les pyramides

    const mainInterfaceSection = document.getElementById('main-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const icosahedron3DContainer = document.getElementById('icosahedron-3d'); // Le conteneur 3D

    // Variables pour stocker les instances des visualiseurs
    let icosahedronVisualizer = null;
    let pyramidsVisualizer = null;

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections de contenu
        if (mainInterfaceSection) mainInterfaceSection.classList.add('hidden');
        if (internalToolInterfaceSection) internalToolInterfaceSection.classList.add('hidden');

        // Arrêter toutes les animations 3D avant de changer
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (pyramidsVisualizer) pyramidsVisualizer.stop();
        
        // Gérer la visibilité du conteneur 3D
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'none'; // Cacher par défaut

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Initialiser et démarrer le bon visualiseur si la section est 3D
        if (sectionId === 'main-interface') {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex'; // Afficher la 3D
            if (!icosahedronVisualizer) {
                icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d'); // <-- Utilise l'ID correct
            }
            if (icosahedronVisualizer) icosahedronVisualizer.start(); // Démarrer l'animation
        } else if (sectionId === 'pyramids-interface') { // Nouvelle section pour les pyramides
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex'; // Afficher la 3D
            if (!pyramidsVisualizer) {
                pyramidsVisualizer = initPyramidsVisualizer('icosahedron-3d'); // <-- Utilise l'ID correct du conteneur partagé
            }
            if (pyramidsVisualizer) pyramidsVisualizer.start(); // Démarrer l'animation
        }
        // Pour 'internal-tool-interface', la 3D reste cachée (display: none)

        // Mettre à jour les boutons de navigation (active class)
        if (navMainButton) navMainButton.classList.remove('active');
        if (navInternalToolButton) navInternalToolButton.classList.remove('active');
        if (navPyramidsButton) navPyramidsButton.classList.remove('active');

        if (sectionId === 'main-interface' && navMainButton) {
            navMainButton.classList.add('active');
        } else if (sectionId === 'internal-tool-interface' && navInternalToolButton) {
            navInternalToolButton.classList.add('active');
        } else if (sectionId === 'pyramids-interface' && navPyramidsButton) {
            navPyramidsButton.classList.add('active');
        }
    }

    // Écouteurs d'événements pour les boutons de navigation
    if (navMainButton) {
        navMainButton.addEventListener('click', () => showSection('main-interface'));
    } else {
        console.error("Bouton de navigation 'Générateur Aléatoire Classique' (#nav-main) non trouvé.");
    }

    if (navInternalToolButton) {
        navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    } else {
        console.error("Bouton de navigation 'Outil Interne de Sécurité' (#nav-internal-tool) non trouvé.");
    }

    if (navPyramidsButton) {
        navPyramidsButton.addEventListener('click', () => showSection('pyramids-interface'));
    } else {
        console.error("Bouton de navigation 'Pyramides Dynamiques' (#nav-pyramids) non trouvé.");
    }

    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});