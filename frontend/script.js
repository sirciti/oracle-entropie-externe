document.addEventListener('DOMContentLoaded', () => {
    const randomNumberDisplay = document.getElementById('random-number');
    const generateButton = document.getElementById('generate-button');
    const entropyDataDisplay = document.getElementById('entropy-data');

    // Fonction pour ajuster la taille du canvas au conteneur
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

    // Ajuste le canvas au chargement et lors des redimensionnements
    window.addEventListener('resize', resizeCanvasToContainer);
    // Appelle aussi régulièrement au cas où le canvas serait créé après coup
    const resizeInterval = setInterval(resizeCanvasToContainer, 500);

    // Arrête l'intervalle si le canvas est bien présent
    function stopResizeIntervalIfReady() {
        const canvas = document.querySelector('#icosahedron-3d canvas');
        if (canvas) {
            clearInterval(resizeInterval);
        }
    }
    setInterval(stopResizeIntervalIfReady, 1000);

    // Gestion du bouton de génération
    generateButton.addEventListener('click', () => {
        fetch('/generate_random')
            .then(response => response.json())
            .then(data => {
                if (data.random_number !== undefined) {
                    // Affiche la valeur telle quelle (token ou nombre)
                    randomNumberDisplay.textContent = data.random_number;
                } else {
                    randomNumberDisplay.textContent = 'Erreur';
                }
                // Optionnel : afficher ou logguer l'entropie
                entropyDataDisplay.textContent = data.entropy_seed || '';
            })
            .catch(error => {
                console.error('Erreur lors de la génération du nombre aléatoire:', error);
                randomNumberDisplay.textContent = 'Erreur';
                entropyDataDisplay.textContent = '';
            });
    });

    // Optionnel : Afficher les données d'entropie initiales au chargement (pour débogage)
    // fetch('/entropy')
    //     .then(response => response.json())
    //     .then(data => {
    //         entropyDataDisplay.textContent = JSON.stringify(data);
    //     })
    //     .catch(error => {
    //         console.error('Erreur lors de la récupération de l\'entropie:', error);
    //         entropyDataDisplay.textContent = 'Erreur lors de la récupération de l\'entropie.';
    //     });
});