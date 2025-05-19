import { test, expect } from '@playwright/test';

test.describe('Oracle d\'Entropie Front-End', () => {
  test('Affichage du nombre aléatoire et de l\'animation icosaèdre', async ({ page }) => {
    // Accède à la page principale
    await page.goto('http://localhost:5173/');

    // Teste le bouton et l’affichage du nombre aléatoire
    await expect(page.locator('#random-number')).toHaveText('--');
    await page.click('#generate-button');
    await expect(page.locator('#random-number')).not.toHaveText('--', { timeout: 3000 });

    // Vérifie que la scène 3D est présente
    const canvas = page.locator('#icosahedron-3d canvas');
    await expect(canvas).toBeVisible();

    // Vérifie que l’animation démarre (le canvas existe et la taille est correcte)
    const width = await canvas.evaluate((el) => el.width);
    const height = await canvas.evaluate((el) => el.height);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});
