import { test, expect } from '@playwright/test';

test.describe("Oracle d'Entropie Front-End", () => {
  test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Vérifie les éléments de base
    await expect(page.locator('#random-number')).toHaveText('--');
    await expect(page.locator('#generate-button')).toBeVisible();
    await expect(page.locator('#icosahedron-3d canvas')).toBeVisible();

    // Génère un nombre aléatoire
    await page.click('#generate-button');
    await expect(page.locator('#random-number')).not.toHaveText('--', { timeout: 3000 });
  });

  test("Affichage de l'animation icosaèdre", async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Vérifie que la scène 3D est présente
    const canvas = page.locator('#icosahedron-3d canvas');
    await expect(canvas).toBeVisible();

    // Vérifie que l’animation démarre (le canvas existe et la taille est correcte)
    const width = await canvas.evaluate((el) => el.width);
    const height = await canvas.evaluate((el) => el.height);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("Redimensionnement de la fenêtre", async ({ page }) => {
    await page.goto('http://localhost:5173/');

    const canvas = page.locator('#icosahedron-3d canvas');
    await expect(canvas).toBeVisible();

    // Redimensionne la fenêtre
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000); // Attend que Three.js s'adapte

    const newWidth = await canvas.evaluate((el) => el.width);
    const newHeight = await canvas.evaluate((el) => el.height);

    expect(newWidth).toBe(800);
    expect(newHeight).toBe(600);
  });

  test("Données d'entropie et génération", async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Clique sur le bouton pour générer un nombre aléatoire
    await page.click('#generate-button');

    // Attend que le nombre aléatoire soit affiché
    await page.waitForSelector('#random-number', { state: 'attached', timeout: 3000 });
    const randomNumber = await page.locator('#random-number').textContent();
    expect(randomNumber).not.toBe('--');

    // Optionnel : Vérifier si les données d'entropie sont visibles (à adapter selon votre implémentation)
    // await expect(page.locator('#entropy-data')).toBeVisible();
  });
});
