// frontend/script.js
export function initClassicGenerator() {
    const generateButton = document.getElementById("generate-button");
    const randomNumberOutput = document.getElementById("random-number");
    const lengthInput = document.getElementById("classic-token-length");
    const includeLower = document.getElementById("classic-lowercase");
    const includeUpper = document.getElementById("classic-uppercase");
    const includeNumbers = document.getElementById("classic-numbers");
    const includeSymbols = document.getElementById("classic-symbols");
    const feedback = document.getElementById("feedback-classic");
    const weatherCheckbox = document.getElementById("classic-weather");

    function validateInput() {
        const length = parseInt(lengthInput.value, 10);
        const charTypesSelected = [includeLower, includeUpper, includeNumbers, includeSymbols].filter(cb => cb.checked).length;

        if (isNaN(length) || length < 8 || length > 128) {
            feedback.textContent = "La longueur doit être entre 8 et 128.";
            feedback.style.color = "#f44336";
            generateButton.disabled = true;
            return false;
        }
        if (charTypesSelected === 0) {
            feedback.textContent = "Sélectionnez au moins un type de caractère.";
            feedback.style.color = "#f44336";
            generateButton.disabled = true;
            return false;
        }
        feedback.textContent = "";
        generateButton.disabled = false;
        return true;
    }

    [lengthInput, includeLower, includeUpper, includeNumbers, includeSymbols].forEach(el =>
        el.addEventListener("input", validateInput)
    );

    validateInput();

    generateButton.addEventListener("click", async () => {
        if (!validateInput()) return;

        const length = parseInt(lengthInput.value, 10);
        const charOptions = {
            lowercase: includeLower.checked,
            uppercase: includeUpper.checked,
            numbers: includeNumbers.checked,
            symbols: includeSymbols.checked
        };
        const geometries = ["cubes", "icosahedron", "pyramids"];
        const weatherEnabled = weatherCheckbox.checked;

        randomNumberOutput.value = "Génération en cours...";
        feedback.textContent = "";

        try {
            const response = await fetch("/api/generate_token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    geometries,
                    weather_enabled: weatherEnabled,
                    length,
                    char_options: charOptions
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            randomNumberOutput.value = data.token;
            feedback.textContent = "Token généré avec succès.";
            feedback.style.color = "green";
        } catch (error) {
            console.error("Erreur génération token:", error);
            randomNumberOutput.value = "";
            feedback.textContent = `Erreur : ${error.message}`;
            feedback.style.color = "#f44336";
        }
    });
};
