// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Oracle d\'Entropie Front-End', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/');
    });

    test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
        await page.waitForSelector('#random-number');
        await page.waitForSelector('#generate-button');
        await page.waitForSelector('#icosahedron-3d canvas');

        await expect(page.locator('#random-number')).toHaveText('--');
        await expect(page.locator('#generate-button')).toBeVisible();
        await expect(page.locator('#icosahedron-3d canvas')).toBeVisible();

        await page.click('#generate-button');
        await expect(page.locator('#random-number')).not.toHaveText('--', { timeout: 3000 });
    });

    test('Animation de l\'icosaèdre', async ({ page }) => {
        const canvas = page.locator('#icosahedron-3d canvas');
        await expect(canvas).toBeVisible();

        // Vérifie que l'animation démarre (présence du canvas et dimensions)
        const { width: initialWidth, height: initialHeight } = await canvas.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        });
        expect(initialWidth).toBeGreaterThan(0);
        expect(initialHeight).toBeGreaterThan(0);

        // TODO: Tester la rotation (plus complexe avec Playwright)
    });

    test('Redimensionnement de la fenêtre', async ({ page }) => {
        const canvas = page.locator('#icosahedron-3d canvas');
        await expect(canvas).toBeVisible();

        const initialRect = await canvas.evaluate(el => el.getBoundingClientRect());

        await page.setViewportSize({ width: 800, height: 600 });
        await page.waitForTimeout(1000);

        const rect = await canvas.evaluate(el => el.getBoundingClientRect());
        expect(rect.width).not.toBe(initialRect.width);
        expect(rect.height).not.toBe(initialRect.height);
    });

    test('Données d\'entropie et génération', async ({ page }) => {
        await page.click('#generate-button');
        await page.waitForSelector('#random-number', { state: 'attached', timeout: 3000 });
        const randomNumber = await page.locator('#random-number').textContent();
        expect(randomNumber).not.toBeNull();
        expect(randomNumber).not.toBe('--');
        // Optionnel : await expect(page.locator('#entropy-data')).toBeVisible();
    });

    test('Erreur lors de la récupération des données de l\'API', async ({ page }) => {
        await page.route('**/generate_random', route => route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Erreur simulée' })
        }));

        await page.goto('http://localhost:5173/');
        await page.click('#generate-button');
        await expect(page.locator('#random-number')).toHaveText('Erreur');
    });
});
