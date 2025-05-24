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
                icosahedronVisualizer = initIcosahedronVisualizer('icosahedron-3d');
            }
            if (icosahedronVisualizer) icosahedronVisualizer.start(); // Démarrer l'animation
        } else if (sectionId === 'pyramids-interface') { // Nouvelle section pour les pyramides
            // Assurez-vous que cette section existe dans index.html si elle n'est pas déjà là
            // Si la section "pyramids-interface" n'existe pas, le code ne fonctionnera pas comme prévu.
            // Pour l'instant, le conteneur 3D est partagé.
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = 'flex'; // Afficher la 3D
            if (!pyramidsVisualizer) {
                pyramidsVisualizer = initPyramidsVisualizer('pyramids-visualizer'); // Utilise le même conteneur 3D
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

// frontend/pyramids_visualizer.js

export function initPyramidsVisualizer(containerId) {
    console.log("initPyramidsVisualizer appelé avec", containerId);
    // Ajoutez ici le code d'initialisation spécifique pour le visualiseur de pyramides
    // Cela peut inclure la création de la scène, de la caméra, des lumières, etc.
    // Assurez-vous d'utiliser le même conteneur que pour l'icosaèdre si c'est ce qui est voulu
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Conteneur pour les pyramides non trouvé:", containerId);
        return null;
    }

    // Exemple d'initialisation (à adapter selon vos besoins)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Ajoutez ici des objets 3D, des lumières, etc. à la scène

    return {
        start: () => {
            // Démarrer l'animation ou le rendu ici
            function animate() {
                requestAnimationFrame(animate);
                // Mettez à jour les objets 3D, la caméra, etc. ici
                renderer.render(scene, camera);
            }
            animate();
        },
        stop: () => {
            // Arrêter l'animation ou le rendu ici
        }
    };
}