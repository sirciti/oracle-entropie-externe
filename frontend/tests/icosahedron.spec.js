// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Oracle d\'Entropie Front-End', () => {
    // Exécuté avant chaque test pour s'assurer que la page est chargée et les éléments clés sont visibles
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Attendre que les éléments clés de l'interface soient visibles avant chaque test
        await page.waitForSelector('#random-number', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('#generate-button', { state: 'visible', timeout: 15000 });
        
        // Attendre que le canvas 3D soit visible et qu'il ait une taille > 0
        const canvasLocator = page.locator('#icosahedron-3d canvas');
        await expect(canvasLocator).toBeVisible({ timeout: 15000 });
        const canvasSize = await canvasLocator.evaluate(el => {
            // Utilisation de instanceof pour vérifier le type d'élément en JavaScript
            if (el instanceof HTMLCanvasElement) {
                return { width: el.width, height: el.height };
            }
            return { width: 0, height: 0 }; // Fallback si ce n'est pas un canvas (ne devrait pas arriver avec ce sélecteur)
        });
        expect(canvasSize.width).toBeGreaterThan(0);
        expect(canvasSize.height).toBeGreaterThan(0);
    });

    test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
        // Vérifie les éléments de base
        const randomNumberLocator = page.locator('#random-number');
        await expect(randomNumberLocator).toHaveText('--');
        await expect(page.locator('#generate-button')).toBeVisible();
        
        // Génère un nombre aléatoire
        await page.click('#generate-button');

        // Attendre que le texte de #random-number change et ne soit plus "--" ou "Chargement..."
        await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
        await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
        
        const randomNumberText = await randomNumberLocator.textContent();
        
        await expect(randomNumberText).not.toBeNull();
        await expect(randomNumberText).not.toBe(''); // Vérifier qu'il n'est pas vide
        await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/); // Vérifier le format hexadécimal
    });

    test('Animation de l\'icosaèdre', async ({ page }) => {
        // La visibilité et la taille du canvas sont déjà vérifiées dans beforeEach
        // Ce test confirme juste la présence de la scène 3D.
    });

    test('Redimensionnement de la fenêtre', async ({ page }) => {
        const appContainer = page.locator('.app-container'); // Cible le conteneur principal qui s'adapte au viewport
        await expect(appContainer).toBeVisible();

        // Redimensionne le viewport du navigateur à une taille spécifique
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(1500); // Laisse du temps au CSS et JS pour s'adapter

        // Vérifie que les dimensions de appContainer correspondent aux nouvelles dimensions du viewport
        const rect = await appContainer.evaluate(el => el.getBoundingClientRect());
        
        expect(rect.width).toBe(800); 
        expect(rect.height).toBe(600); 
    });

    test('Données d\'entropie et génération', async ({ page }) => {
        // Clique sur le bouton "Générer"
        await page.click('#generate-button');

        // Attendre que le texte de #random-number change (non vide, non "--", non "Chargement...")
        const randomNumberLocator = page.locator('#random-number');
        await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
        await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
        
        const randomNumberText = await randomNumberLocator.textContent();
        
        await expect(randomNumberText).not.toBeNull();
        await expect(randomNumberText).not.toBe('');
        await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/);
    });

    test('Erreur lors de la récupération des données de l\'API', async ({ page }) => {
        // Intercepter la requête /generate_random et simuler une erreur 500
        await page.route('**/generate_random', route => {
            route.fulfill({ status: 500, body: JSON.stringify({ error: 'Erreur simulée' }) });
        });

        await page.goto('http://localhost:5173/'); 
        await page.click('#generate-button');

        // Vérifier que le message d'erreur "Erreur" est affiché
        const randomNumberLocator = page.locator('#random-number');
        await expect(randomNumberLocator).toHaveText('Erreur', { timeout: 5000 });
    });

    test('Outil Interne de Sécurité - Génération de token avec options', async ({ page }) => {
        // Naviguer vers l'outil interne
        await page.click('#nav-internal-tool');
        await page.waitForSelector('#internal-tool-interface', { state: 'visible' });

        // Vérifier les champs par défaut
        const lengthInput = page.locator('#token-length');
        const includeLower = page.locator('#include-lowercase');
        const includeNumbers = page.locator('#include-numbers');
        const generateSecureButton = page.locator('#generate-secure-button');
        const generatedTokenDisplay = page.locator('#generated-token');
        const feedbackMessage = page.locator('#feedback-message');

        await expect(lengthInput).toHaveValue('32');
        await expect(includeLower).toBeChecked();
        await expect(includeNumbers).toBeChecked();
        await expect(generateSecureButton).not.toBeDisabled();

        // Générer un token avec les options par défaut
        await generateSecureButton.click();
        
        // Attendre que le token généré ne soit plus vide et ne soit pas "Génération en cours..."
        await expect(generatedTokenDisplay).not.toBeEmpty({ timeout: 5000 });
        await expect(generatedTokenDisplay).not.toHaveValue('Génération en cours...', { timeout: 5000 });

        // Vérifier le message de succès
        await expect(feedbackMessage).toHaveText('Token généré avec succès.', { timeout: 5000 });
        
        // Utiliser .inputValue() pour lire le contenu de la textarea de manière fiable
        const generatedTokenText = await generatedTokenDisplay.inputValue(); 
        await expect(generatedTokenText).toMatch(/^[0-9a-zA-Z!@#$%^&*()-_=+\[\]{}|;:,.<>?'"`~]+$/); 

        // Tester une composition spécifique : minuscules et chiffres, longueur 10
        await lengthInput.fill('10');
        await page.locator('#include-uppercase').uncheck();
        await page.locator('#include-symbols').uncheck();
        await generateSecureButton.click();

        // Attendre que le token généré ne soit plus vide et ne soit pas "Génération en cours..."
        await expect(generatedTokenDisplay).not.toBeEmpty({ timeout: 5000 });
        await expect(generatedTokenDisplay).not.toHaveValue('Génération en cours...', { timeout: 5000 });
        
        // Vérifier le message de succès pour cette composition
        await expect(feedbackMessage).toHaveText('Token généré avec succès.', { timeout: 5000 });

        const generatedTokenTextSpecific = await generatedTokenDisplay.inputValue(); 
        await expect(generatedTokenTextSpecific).toHaveLength(10);
        await expect(generatedTokenTextSpecific).toMatch(/^[0-9a-z]+$/); // Seulement minuscules et chiffres

        // Tester la copie (simuler le clic sur le bouton copier)
        await page.locator('#copy-token-button').click();
        await expect(feedbackMessage).toHaveText('Token copié dans le presse-papiers !');
    });

    test('Outil Interne de Sécurité - Validation des erreurs', async ({ page }) => {
        // Naviguer vers l'outil interne
        await page.click('#nav-internal-tool');
        await page.waitForSelector('#internal-tool-interface', { state: 'visible' });

        const lengthInput = page.locator('#token-length');
        const includeLower = page.locator('#include-lowercase');
        const generateSecureButton = page.locator('#generate-secure-button');
        const feedbackMessage = page.locator('#feedback-message');

        // Tester longueur invalide
        await lengthInput.fill('5');
        await expect(feedbackMessage).toHaveText('La longueur doit être comprise entre 8 et 128.');
        await expect(generateSecureButton).toBeDisabled();

        // Tester aucun type de caractère sélectionné
        await lengthInput.fill('16'); // Longueur valide
        await includeLower.uncheck();
        await page.locator('#include-uppercase').uncheck();
        await page.locator('#include-numbers').uncheck();
        await page.locator('#include-symbols').uncheck();
        await expect(feedbackMessage).toHaveText('Veuillez sélectionner au moins un type de caractère.');
        await expect(generateSecureButton).toBeDisabled();
    });
});