// frontend/src/views/internal_tool.js

export function initInternalTool() {
    const internalToolInterfaceSection = document.getElementById("internal-tool-interface");
    if (internalToolInterfaceSection) {
        const lengthInput = document.getElementById("token-length");
        const includeLower = document.getElementById("include-lowercase");
        const includeUpper = document.getElementById("include-uppercase");
        const includeNumbers = document.getElementById("include-numbers");
        const includeSymbols = document.getElementById("include-symbols");
        const generateSecureButton = document.getElementById("generate-secure-button");
        const generatedTokenDisplay = document.getElementById("generated-token");
        const copyTokenButton = document.getElementById("copy-token-button");
        const feedback = document.getElementById("feedback-message");

        if (lengthInput && includeLower && includeUpper && includeNumbers &&
            includeSymbols && generateSecureButton && generatedTokenDisplay &&
            copyTokenButton && feedback) {

            function validateInput() {
                const length = parseInt(lengthInput.value, 10);
                const charTypesSelected = [includeLower, includeUpper, includeNumbers, includeSymbols].filter(cb => cb.checked).length;

                if (isNaN(length) || length < 8 || length > 128) {
                    feedback.textContent = "La longueur doit être comprise entre 8 et 128.";
                    feedback.style.color = "#f44336";
                    generateSecureButton.disabled = true;
                    copyTokenButton.disabled = true;
                    return false;
                }
                if (charTypesSelected === 0) {
                    feedback.textContent = "Veuillez sélectionner au moins un type de caractère.";
                    feedback.style.color = "#f44336";
                    generateSecureButton.disabled = true;
                    copyTokenButton.disabled = true;
                    return false;
                }
                feedback.textContent = "";
                generateSecureButton.disabled = false;
                return true;
            }

            [lengthInput, includeLower, includeUpper, includeNumbers, includeSymbols].forEach(el =>
                el.addEventListener("input", validateInput)
            );

            validateInput();

            generateSecureButton.addEventListener("click", async () => {
                if (!validateInput()) return;

                const length = parseInt(lengthInput.value, 10);
                const geometries = ["cubes", "icosahedron", "spiral_simple", "spiral_torus"];
                const weatherEnabled = true;
                const charOptions = {
                    lowercase: includeLower.checked,
                    uppercase: includeUpper.checked,
                    numbers: includeNumbers.checked,
                    symbols: includeSymbols.checked
                };

                generatedTokenDisplay.value = "Génération en cours...";
                copyTokenButton.disabled = true;
                feedback.textContent = "";

                try {
                    const token = await generateSecureToken(geometries, weatherEnabled, length, charOptions);
                    generatedTokenDisplay.value = token;
                    copyTokenButton.disabled = false;
                    feedback.textContent = "Token généré avec succès.";
                    feedback.style.color = "green";
                } catch (error) {
                    console.error("Erreur lors de la génération du token sécurisé:", error);
                    generatedTokenDisplay.value = "";
                    feedback.textContent = `Erreur lors de la génération : ${error.message}`;
                    feedback.style.color = "#f44336";
                    copyTokenButton.disabled = true;
                }
            });

            copyTokenButton.addEventListener("click", () => {
                generatedTokenDisplay.select();
                try {
                    document.execCommand("copy");
                    feedback.textContent = "Token copié dans le presse-papiers !";
                    feedback.style.color = "green";
                } catch (err) {
                    console.error("Erreur lors de la copie:", err);
                    feedback.textContent = "Échec de la copie. Veuillez copier manuellement.";
                    feedback.style.color = "#f44336";
                }
            });

        } else {
            console.error("Un ou plusieurs éléments nécessaires pour l'outil interne n'ont pas été trouvés dans le DOM. Assurez-vous que #internal-tool-interface est visible et contient tous les IDs.");
        }
    } else {
        console.error("La section 'Outil Interne de Sécurité' (#internal-tool-interface) n'a pas été trouvée.");
    }
}

async function generateSecureToken(geometries = ["cubes", "icosahedron", "spiral_simple", "spiral_torus"], weatherEnabled = true, length = 32, charOptions = {}) {
    try {
        const response = await fetch("/generate_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geometries, weather_enabled: weatherEnabled, length, char_options: charOptions })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.token;
    } catch (error) {
        console.error("Erreur lors de la génération du token sécurisé:", error);
        throw error;
    }
}