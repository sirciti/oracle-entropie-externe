// frontend/script.js

document.addEventListener("DOMContentLoaded", () => {
    const randomNumberDisplay = document.getElementById("random-number");
    const generateButton = document.getElementById("generate-button");
    const entropyDataDisplay = document.getElementById("entropy-data");

    // --- Gestion du bouton de génération de nombre aléatoire (interface classique) ---
    if (generateButton && randomNumberDisplay) {
        generateButton.addEventListener("click", () => {
            randomNumberDisplay.textContent = "Chargement...";
            if (entropyDataDisplay) {
                entropyDataDisplay.textContent = "";
            }

            fetch("http://127.0.0.1:5000/generate_random") // URL absolue vers le backend Flask
                .then(response => {
                    if (!response.ok) {
                        // Si la réponse HTTP n'est pas OK, lever une erreur avec le statut
                        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Vérifier que data.random_number est une chaîne non vide
                    if (data && typeof data.random_number === "string" && data.random_number.length > 0) {
                        randomNumberDisplay.textContent = data.random_number;
                    } else {
                        // Afficher une erreur plus spécifique si la donnée est invalide ou manquante
                        randomNumberDisplay.textContent = "Erreur données invalides";
                        console.error("Données aléatoires inattendues ou manquantes:", data);
                    }
                    if (entropyDataDisplay) {
                        entropyDataDisplay.textContent = data.entropy_seed ? `Seed: ${data.entropy_seed}` : "";
                    }
                })
                .catch(error => {
                    // Gérer les erreurs survenues pendant le fetch ou le traitement de la réponse
                    console.error("Erreur lors de la génération du nombre aléatoire:", error);
                    // S'assurer que le message d'erreur est bien affiché
                    if (randomNumberDisplay) randomNumberDisplay.textContent = "Erreur"; 
                    if (entropyDataDisplay) entropyDataDisplay.textContent = "";
                });
        });
    } else {
        console.error("Éléments nécessaires (bouton ou affichage nombre) pour l'interface principale non trouvés.");
    }
});