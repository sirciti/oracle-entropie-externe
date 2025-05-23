// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Oracle d\'Entropie Front-End', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
        // Attendre que les éléments clés de l'interface soient visibles avant chaque test
        await page.waitForSelector('#random-number', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('#generate-button', { state: 'visible', timeout: 15000 });
        // Pour le canvas 3D, on attend qu'il soit visible et qu'il ait une taille > 0
        const canvasLocator = page.locator('#icosahedron-3d canvas');
        await expect(canvasLocator).toBeVisible({ timeout: 15000 });
        const canvasSize = await canvasLocator.evaluate(el => ({width: el.width, height: el.height}));
        expect(canvasSize.width).toBeGreaterThan(0);
        expect(canvasSize.height).toBeGreaterThan(0);
    });

    test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
        // Vérifie les éléments de base
        await expect(page.locator('#random-number')).toHaveText('--');
        await expect(page.locator('#generate-button')).toBeVisible();
        
        // Génère un nombre aléatoire
        await page.click('#generate-button');

        // Attendre que le texte de #random-number change et ne soit plus "--"
        await expect(page.locator('#random-number')).not.toHaveText('--', { timeout: 10000 });
        await expect(page.locator('#random-number')).not.toBeEmpty({ timeout: 10000 });
        await expect(page.locator('#random-number')).toMatch(/^[0-9a-fA-F]+$/); // Vérifier le format hexadécimal
    });

    test('Animation de l\'icosaèdre', async ({ page }) => {
        // La visibilité du canvas est déjà vérifiée dans beforeEach
        // Vérifie que l'animation démarre (en vérifiant les dimensions initiales)
        const canvas = page.locator('#icosahedron-3d canvas');
        const initialSize = await canvas.evaluate(el => ({width: el.width, height: el.height}));
        expect(initialSize.width).toBeGreaterThan(0);
        expect(initialSize.height).toBeGreaterThan(0);
        
        // Plus difficile à tester sans des tests visuels ou une comparaison de pixels.
        // On peut vérifier une petite rotation si le JS expose des props, ou juste la présence du canvas.
        // Ici, on s'appuie sur la visibilité et la taille non nulle.
    });

    test('Redimensionnement de la fenêtre', async ({ page }) => {
        const canvas = page.locator('#icosahedron-3d canvas');
        await expect(canvas).toBeVisible();

        // Stocke les dimensions initiales du canvas
        const initialRect = await canvas.evaluate(el => el.getBoundingClientRect());
        
        // Redimensionne la fenêtre à une nouvelle taille fixe et distincte
        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(1500); // Laisse plus de temps à Three.js pour s'adapter après le resize

        // Vérifie que les dimensions affichées du canvas ont changé ET correspondent aux nouvelles dimensions du viewport
        const rect = await canvas.evaluate(el => el.getBoundingClientRect());
        expect(rect.width).toBe(800); // Devrait correspondre à la nouvelle largeur du viewport
        expect(rect.height).toBe(600); // Devrait correspondre à la nouvelle hauteur du viewport
    });

    test('Données d\'entropie et génération', async ({ page }) => {
        // Clique sur le bouton pour générer un nombre aléatoire
        await page.click('#generate-button');

        // Attendre que le nombre aléatoire soit affiché (même logique que le premier test)
        await expect(page.locator('#random-number')).not.toHaveText('--', { timeout: 10000 });
        await expect(page.locator('#random-number')).not.toBeEmpty({ timeout: 10000 });
        await expect(page.locator('#random-number')).toMatch(/^[0-9a-fA-F]+$/);
    });

    test('Erreur lors de la récupération des données de l\'API', async ({ page }) => {
        // Simule une erreur en interceptant la requête /generate_random
        // L'interception de la route doit être active AVANT le page.goto
        await page.route('**/generate_random', route => {
            console.log('Intercepting /generate_random for error test'); // Debug log
            route.fulfill({ status: 500, body: JSON.stringify({ error: 'Erreur simulée' }) });
        });

        await page.goto('http://localhost:5173/'); // Recharger la page pour que l'interception soit active
        await page.click('#generate-button');

        // Vérifie que le nombre aléatoire affiche "Erreur"
        await expect(page.locator('#random-number')).toHaveText('Erreur', { timeout: 5000 });
    });
});