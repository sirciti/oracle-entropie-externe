document.addEventListener('DOMContentLoaded', () => {
    const randomNumberDisplay = document.getElementById('random-number');
    const generateButton = document.getElementById('generate-button');
    const entropyDataDisplay = document.getElementById('entropy-data');

    generateButton.addEventListener('click', () => {
        fetch('/generate_random')
            .then(response => response.json())
            .then(data => {
                randomNumberDisplay.textContent = data.random_number.toFixed(6); // Display only the random number
                // Optionally log the entropy data to the console for debugging (not displayed on the page)
                console.log("Entropy data:", data.entropy_seed);
                entropyDataDisplay.textContent = ""; // Clear the entropy display
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