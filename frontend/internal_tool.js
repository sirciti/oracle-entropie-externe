document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne les éléments DANS la section de l'outil interne (qui est déjà dans index.html)
    const lengthInput = document.getElementById('token-length');
    const includeLower = document.getElementById('include-lowercase');
    const includeUpper = document.getElementById('include-uppercase');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const generateSecureButton = document.getElementById('generate-secure-button');
    const generatedTokenDisplay = document.getElementById('generated-token');
    const copyTokenButton = document.getElementById('copy-token-button');
    const feedback = document.getElementById('feedback-message');

    // Vérifie que tous les éléments nécessaires pour cet outil sont présents
    if (lengthInput && includeLower && includeUpper && includeNumbers &&
        includeSymbols && generateSecureButton && generatedTokenDisplay &&
        copyTokenButton && feedback) {

        // Fonction de validation de l'entrée utilisateur
        function validateInput() {
            const length = parseInt(lengthInput.value, 10);
            const charTypesSelected = [includeLower, includeUpper, includeNumbers, includeSymbols].filter(cb => cb.checked).length;

            if (isNaN(length) || length < 8 || length > 128) {
                feedback.textContent = 'La longueur doit être comprise entre 8 et 128.';
                feedback.style.color = '#f44336';
                generateSecureButton.disabled = true;
                copyTokenButton.disabled = true;
                return false;
            }
            if (charTypesSelected === 0) {
                feedback.textContent = 'Veuillez sélectionner au moins un type de caractère.';
                feedback.style.color = '#f44336';
                generateSecureButton.disabled = true;
                copyTokenButton.disabled = true;
                return false;
            }
            feedback.textContent = '';
            generateSecureButton.disabled = false;
            return true;
        }

        // Ajoute les écouteurs d'événements pour la validation en temps réel
        [lengthInput, includeLower, includeUpper, includeNumbers, includeSymbols].forEach(el =>
            el.addEventListener('input', validateInput)
        );

        // Validation initiale au chargement de l'interface
        validateInput();

        // Gère le bouton de génération sécurisée
        generateSecureButton.addEventListener('click', () => {
            if (!validateInput()) return;

            const length = parseInt(lengthInput.value, 10);
            const params = new URLSearchParams({
                length: length,
                lowercase: includeLower.checked,
                uppercase: includeUpper.checked,
                numbers: includeNumbers.checked,
                symbols: includeSymbols.checked
            });

            generatedTokenDisplay.value = 'Génération en cours...';
            copyTokenButton.disabled = true;
            feedback.textContent = '';

            fetch(`http://127.0.0.1:5000/generate_token?${params.toString()}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && typeof data.token === 'string' && data.token.length > 0) {
                        generatedTokenDisplay.value = data.token;
                        copyTokenButton.disabled = false;
                        feedback.textContent = 'Token généré avec succès.';
                        feedback.style.color = 'green';
                    } else {
                        generatedTokenDisplay.value = '';
                        feedback.textContent = 'Erreur : token non reçu ou invalide.';
                        feedback.style.color = '#f44336';
                        copyTokenButton.disabled = true;
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la génération du token sécurisé:', error);
                    generatedTokenDisplay.value = '';
                    feedback.textContent = `Erreur lors de la génération : ${error.message}`;
                    feedback.style.color = '#f44336';
                    copyTokenButton.disabled = true;
                });
        });

        // Gère le bouton de copie
        copyTokenButton.addEventListener('click', () => {
            generatedTokenDisplay.select();
            try {
                document.execCommand('copy');
                feedback.textContent = 'Token copié dans le presse-papiers !';
                feedback.style.color = 'green';
            } catch (err) {
                console.error('Erreur lors de la copie:', err);
                feedback.textContent = 'Échec de la copie. Veuillez copier manuellement.';
                feedback.style.color = '#f44336';
            }
        });

        // Le bouton "Retour à l'Accueil" est maintenant géré par navigation.js
        // Donc, la logique ici est retirée.
    } else {
        console.error("Un ou plusieurs éléments nécessaires pour l'outil interne n'ont pas été trouvés dans le DOM. Assurez-vous que #internal-tool-interface est visible et contient tous les IDs.");
    }
});

