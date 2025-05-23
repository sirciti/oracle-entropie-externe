document.addEventListener('DOMContentLoaded', () => {
    const navMainButton = document.getElementById('nav-main');
    const navInternalToolButton = document.getElementById('nav-internal-tool');

    const mainInterfaceSection = document.getElementById('main-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const icosahedron3DContainer = document.getElementById('icosahedron-3d'); // Le conteneur 3D

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections
        if (mainInterfaceSection) mainInterfaceSection.classList.add('hidden');
        if (internalToolInterfaceSection) internalToolInterfaceSection.classList.add('hidden');

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Gérer la visibilité du conteneur 3D (seulement visible sur l'interface principale)
        if (icosahedron3DContainer) {
            if (sectionId === 'main-interface') {
                icosahedron3DContainer.style.display = 'flex'; // Afficher la 3D
            } else {
                icosahedron3DContainer.style.display = 'none'; // Cacher la 3D
            }
        }

        // Mettre à jour les boutons de navigation (active class)
        if (navMainButton) navMainButton.classList.remove('active');
        if (navInternalToolButton) navInternalToolButton.classList.remove('active');

        if (sectionId === 'main-interface' && navMainButton) {
            navMainButton.classList.add('active');
        } else if (sectionId === 'internal-tool-interface' && navInternalToolButton) {
            navInternalToolButton.classList.add('active');
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

    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});
