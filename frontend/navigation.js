document.addEventListener('DOMContentLoaded', () => {
    const navMainButton = document.getElementById('nav-main');
    const navInternalToolButton = document.getElementById('nav-internal-tool');

    const mainInterfaceSection = document.getElementById('main-interface');
    const internalToolInterfaceSection = document.getElementById('internal-tool-interface');
    const icosahedron3DContainer = document.getElementById('icosahedron-3d'); // Le conteneur 3D

    // Fonction pour afficher une section et cacher les autres
    function showSection(sectionId) {
        // Cacher toutes les sections
        mainInterfaceSection.classList.add('hidden');
        internalToolInterfaceSection.classList.add('hidden');

        // Afficher la section demandée
        document.getElementById(sectionId).classList.remove('hidden');

        // Gérer la visibilité du conteneur 3D
        if (sectionId === 'main-interface') {
            icosahedron3DContainer.style.display = 'flex'; // Afficher la 3D
        } else {
            icosahedron3DContainer.style.display = 'none'; // Cacher la 3D
        }

        // Mettre à jour les boutons de navigation (active class)
        navMainButton.classList.remove('active');
        navInternalToolButton.classList.remove('active');
        document.getElementById(`nav-${sectionId.replace('-interface', '')}`).classList.add('active');
    }

    // Écouteurs d'événements pour les boutons de navigation
    if (navMainButton) {
        navMainButton.addEventListener('click', () => showSection('main-interface'));
    }
    if (navInternalToolButton) {
        navInternalToolButton.addEventListener('click', () => showSection('internal-tool-interface'));
    }

    // Afficher la section principale par défaut au chargement
    showSection('main-interface');
});
