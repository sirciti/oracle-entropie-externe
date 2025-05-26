# Test info

- Name: Oracle d'Entropie Front-End >> Redimensionnement de la fenêtre
- Location: G:\oracle-entropie-externe\frontend\tests\icosahedron.spec.js:51:5

# Error details

```
Error: Timed out 15000ms waiting for expect(locator).toBeVisible()

Locator: locator('#icosahedron-3d canvas')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 15000ms
  - waiting for locator('#icosahedron-3d canvas')

    at G:\oracle-entropie-externe\frontend\tests\icosahedron.spec.js:14:37
```

# Page snapshot

```yaml
- navigation:
  - button "Générateur Aléatoire Classique"
  - button "Icosaèdre Dynamique"
  - button "Pyramides Dynamiques"
  - button "Outil Interne de Sécurité"
- heading "Nombre Aléatoire Généré" [level=1]
- text: "--"
- button "Générer"
```

# Test source

```ts
   1 | // @ts-check
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | test.describe('Oracle d\'Entropie Front-End', () => {
   5 |     // Exécuté avant chaque test pour s'assurer que la page est chargée et les éléments clés sont visibles
   6 |     test.beforeEach(async ({ page }) => {
   7 |         await page.goto('http://localhost:5173/');
   8 |         // Attendre que les éléments clés de l'interface soient visibles avant chaque test
   9 |         await page.waitForSelector('#random-number', { state: 'visible', timeout: 15000 });
   10 |         await page.waitForSelector('#generate-button', { state: 'visible', timeout: 15000 });
   11 |         
   12 |         // Attendre que le canvas 3D soit visible et qu'il ait une taille > 0
   13 |         const canvasLocator = page.locator('#icosahedron-3d canvas');
>  14 |         await expect(canvasLocator).toBeVisible({ timeout: 15000 });
      |                                     ^ Error: Timed out 15000ms waiting for expect(locator).toBeVisible()
   15 |         const canvasSize = await canvasLocator.evaluate(el => {
   16 |             // Utilisation de instanceof pour vérifier le type d'élément en JavaScript
   17 |             if (el instanceof HTMLCanvasElement) {
   18 |                 return { width: el.width, height: el.height };
   19 |             }
   20 |             return { width: 0, height: 0 }; // Fallback si ce n'est pas un canvas (ne devrait pas arriver avec ce sélecteur)
   21 |         });
   22 |         expect(canvasSize.width).toBeGreaterThan(0);
   23 |         expect(canvasSize.height).toBeGreaterThan(0);
   24 |     });
   25 |
   26 |     test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
   27 |         // Vérifie les éléments de base
   28 |         const randomNumberLocator = page.locator('#random-number');
   29 |         await expect(randomNumberLocator).toHaveText('--');
   30 |         await expect(page.locator('#generate-button')).toBeVisible();
   31 |         
   32 |         // Génère un nombre aléatoire
   33 |         await page.click('#generate-button');
   34 |
   35 |         // Attendre que le texte de #random-number change et ne soit plus "--" ou "Chargement..."
   36 |         await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
   37 |         await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
   38 |         
   39 |         const randomNumberText = await randomNumberLocator.textContent();
   40 |         
   41 |         await expect(randomNumberText).not.toBeNull();
   42 |         await expect(randomNumberText).not.toBe(''); // Vérifier qu'il n'est pas vide
   43 |         await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/); // Vérifier le format hexadécimal
   44 |     });
   45 |
   46 |     test('Animation de l\'icosaèdre', async ({ page }) => {
   47 |         // La visibilité et la taille du canvas sont déjà vérifiées dans beforeEach
   48 |         // Ce test confirme juste la présence de la scène 3D.
   49 |     });
   50 |
   51 |     test('Redimensionnement de la fenêtre', async ({ page }) => {
   52 |         const appContainer = page.locator('.app-container'); // Cible le conteneur principal qui s'adapte au viewport
   53 |         await expect(appContainer).toBeVisible();
   54 |
   55 |         // Redimensionne le viewport du navigateur à une taille spécifique
   56 |         await page.setViewportSize({ width: 800, height: 600 });
   57 |         await page.waitForTimeout(1500); // Laisse du temps au CSS et JS pour s'adapter
   58 |
   59 |         // Vérifie que les dimensions de appContainer correspondent aux nouvelles dimensions du viewport
   60 |         const rect = await appContainer.evaluate(el => el.getBoundingClientRect());
   61 |         
   62 |         expect(rect.width).toBe(800); 
   63 |         expect(rect.height).toBe(600); 
   64 |     });
   65 |
   66 |     test('Données d\'entropie et génération', async ({ page }) => {
   67 |         // Clique sur le bouton "Générer"
   68 |         await page.click('#generate-button');
   69 |
   70 |         // Attendre que le texte de #random-number change (non vide, non "--", non "Chargement...")
   71 |         const randomNumberLocator = page.locator('#random-number');
   72 |         await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
   73 |         await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
   74 |         
   75 |         const randomNumberText = await randomNumberLocator.textContent();
   76 |         
   77 |         await expect(randomNumberText).not.toBeNull();
   78 |         await expect(randomNumberText).not.toBe('');
   79 |         await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/);
   80 |     });
   81 |
   82 |     test('Erreur lors de la récupération des données de l\'API', async ({ page }) => {
   83 |         // Intercepter la requête /generate_random et simuler une erreur 500
   84 |         await page.route('**/generate_random', route => {
   85 |             route.fulfill({ status: 500, body: JSON.stringify({ error: 'Erreur simulée' }) });
   86 |         });
   87 |
   88 |         await page.goto('http://localhost:5173/'); 
   89 |         await page.click('#generate-button');
   90 |
   91 |         // Vérifier que le message d'erreur "Erreur" est affiché
   92 |         const randomNumberLocator = page.locator('#random-number');
   93 |         await expect(randomNumberLocator).toHaveText('Erreur', { timeout: 5000 });
   94 |     });
   95 |
   96 |     test('Outil Interne de Sécurité - Génération de token avec options', async ({ page }) => {
   97 |         // Naviguer vers l'outil interne
   98 |         await page.click('#nav-internal-tool');
   99 |         await page.waitForSelector('#internal-tool-interface', { state: 'visible' });
  100 |
  101 |         // Vérifier les champs par défaut
  102 |         const lengthInput = page.locator('#token-length');
  103 |         const includeLower = page.locator('#include-lowercase');
  104 |         const includeNumbers = page.locator('#include-numbers');
  105 |         const generateSecureButton = page.locator('#generate-secure-button');
  106 |         const generatedTokenDisplay = page.locator('#generated-token');
  107 |         const feedbackMessage = page.locator('#feedback-message');
  108 |
  109 |         await expect(lengthInput).toHaveValue('32');
  110 |         await expect(includeLower).toBeChecked();
  111 |         await expect(includeNumbers).toBeChecked();
  112 |         await expect(generateSecureButton).not.toBeDisabled();
  113 |
  114 |         // Générer un token avec les options par défaut
```