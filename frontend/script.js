document.addEventListener('DOMContentLoaded', () => {
    const randomNumberDisplay = document.getElementById('random-number');
    const generateButton = document.getElementById('generate-button');
    const entropyDataDisplay = document.getElementById('entropy-data');

    generateButton.addEventListener('click', () => {
        fetch('/generate_random')
            .then(response => response.json())
            .then(data => {
                randomNumberDisplay.textContent = data.random_number.toFixed(6);
                // Optionally display entropy data for debugging
                if (data.entropy) {
                    entropyDataDisplay.textContent = JSON.stringify(data.entropy);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la génération du nombre aléatoire:', error);
                randomNumberDisplay.textContent = 'Erreur';
                entropyDataDisplay.textContent = '';
            });
    });

    // Optionnel : Afficher les données d'entropie initiales au chargement
    fetch('/entropy')
        .then(response => response.json())
        .then(data => {
            entropyDataDisplay.textContent = JSON.stringify(data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération de l\'entropie:', error);
            entropyDataDisplay.textContent = 'Erreur lors de la récupération de l\'entropie.';
        });
});