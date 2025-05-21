document.addEventListener('DOMContentLoaded', () => {
    const randomNumberDisplay = document.getElementById('random-number');
    const generateButton = document.getElementById('generate-button');
    const entropyDataDisplay = document.getElementById('entropy-data');
    const mainInterfaceSection = document.getElementById('main-interface'); // La section que ce script gère

    // --- Gestion du redimensionnement du canvas Three.js ---
    // Cette fonction est appelée ici car script.js est le point d'entrée principal du front-end.
    // Elle est également appelée par icosahedron.js
    function resizeCanvasToContainer() {
        const canvas = document.querySelector('#icosahedron-3d canvas');
        const container = document.getElementById('icosahedron-3d');

        if (canvas && container) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }
    }

    window.addEventListener('resize', resizeCanvasToContainer);
    const resizeInterval = setInterval(resizeCanvasToContainer, 500);

    function stopResizeIntervalIfReady() {
        const canvas = document.querySelector('#icosahedron-3d canvas');
        if (canvas) {
            clearInterval(resizeInterval);
        }
    }
    setInterval(stopResizeIntervalIfReady, 1000);


    // --- Gestion du bouton de génération de nombre aléatoire (interface classique) ---
    if (generateButton && randomNumberDisplay) {
        generateButton.addEventListener('click', () => {
            randomNumberDisplay.textContent = 'Chargement...';
            if (entropyDataDisplay) {
                entropyDataDisplay.textContent = '';
            }

            fetch('http://127.0.0.1:5000/generate_random')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && typeof data.random_number === 'string' && data.random_number.length > 0) {
                        randomNumberDisplay.textContent = data.random_number;
                    } else {
                        randomNumberDisplay.textContent = 'Erreur données invalides';
                        console.error('Données aléatoires inattendues ou manquantes:', data);
                    }
                    if (entropyDataDisplay) {
                        entropyDataDisplay.textContent = data.entropy_seed ? `Seed: ${data.entropy_seed}` : '';
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la génération du nombre aléatoire:', error);
                    randomNumberDisplay.textContent = 'Erreur';
                    if (entropyDataDisplay) entropyDataDisplay.textContent = '';
                });
        });
    } else {
        console.error("Éléments nécessaires (bouton ou affichage nombre) pour l'interface principale non trouvés.");
    }
});
