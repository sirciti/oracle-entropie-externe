# Test info

- Name: Oracle d'Entropie Front-End >> Affichage initial et génération de nombre aléatoire
- Location: G:\oracle-entropie-externe\frontend\tests\icosahedron.spec.js:19:5

# Error details

```
Error: expect(received).toMatch(expected)

Expected pattern: /^[0-9a-fA-F]+$/
Received string:  "Erreur"
    at G:\oracle-entropie-externe\frontend\tests\icosahedron.spec.js:36:40
```

# Page snapshot

```yaml
- navigation:
  - button "Générateur Aléatoire Classique"
  - button "Outil Interne de Sécurité"
  - button "Pyramides Dynamiques"
- heading "Nombre Aléatoire Généré" [level=1]
- text: Erreur
- button "Générer"
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Oracle d\'Entropie Front-End', () => {
   4 |     // Exécuté avant chaque test pour s'assurer que la page est chargée et les éléments clés sont visibles
   5 |     test.beforeEach(async ({ page }) => {
   6 |         await page.goto('http://localhost:5173/');
   7 |         // Attendre que les éléments clés de l'interface soient visibles avant chaque test
   8 |         await page.waitForSelector('#random-number', { state: 'visible', timeout: 15000 });
   9 |         await page.waitForSelector('#generate-button', { state: 'visible', timeout: 15000 });
   10 |         
   11 |         // Attendre que le canvas 3D soit visible et qu'il ait une taille > 0
   12 |         const canvasLocator = page.locator('#icosahedron-3d canvas');
   13 |         await expect(canvasLocator).toBeVisible({ timeout: 15000 });
   14 |         const canvasSize = await canvasLocator.evaluate(el => ({width: el.width, height: el.height}));
   15 |         expect(canvasSize.width).toBeGreaterThan(0);
   16 |         expect(canvasSize.height).toBeGreaterThan(0);
   17 |     });
   18 |
   19 |     test('Affichage initial et génération de nombre aléatoire', async ({ page }) => {
   20 |         // Vérifie les éléments de base
   21 |         const randomNumberLocator = page.locator('#random-number');
   22 |         await expect(randomNumberLocator).toHaveText('--');
   23 |         await expect(page.locator('#generate-button')).toBeVisible();
   24 |         
   25 |         // Génère un nombre aléatoire
   26 |         await page.click('#generate-button');
   27 |
   28 |         // Attendre que le texte de #random-number change et ne soit plus "--" ou "Chargement..."
   29 |         await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
   30 |         await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
   31 |         
   32 |         const randomNumberText = await randomNumberLocator.textContent();
   33 |         
   34 |         await expect(randomNumberText).not.toBeNull();
   35 |         await expect(randomNumberText).not.toBe(''); // Vérifier qu'il n'est pas vide
>  36 |         await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/); // Vérifier le format hexadécimal
      |                                        ^ Error: expect(received).toMatch(expected)
   37 |     });
   38 |
   39 |     test('Animation de l\'icosaèdre', async ({ page }) => {
   40 |         // La visibilité et la taille du canvas sont déjà vérifiées dans beforeEach
   41 |         // Ce test confirme juste la présence de la scène 3D.
   42 |     });
   43 |
   44 |     test('Redimensionnement de la fenêtre', async ({ page }) => {
   45 |         const appContainer = page.locator('.app-container'); // Cible le conteneur principal qui s'adapte au viewport
   46 |         await expect(appContainer).toBeVisible();
   47 |
   48 |         // Redimensionne le viewport du navigateur à une taille spécifique
   49 |         await page.setViewportSize({ width: 800, height: 600 });
   50 |         await page.waitForTimeout(1500); // Laisse du temps au CSS et JS pour s'adapter
   51 |
   52 |         // Vérifie que les dimensions de appContainer correspondent aux nouvelles dimensions du viewport
   53 |         const rect = await appContainer.evaluate(el => el.getBoundingClientRect());
   54 |         
   55 |         expect(rect.width).toBe(800); 
   56 |         expect(rect.height).toBe(600); 
   57 |     });
   58 |
   59 |     test('Données d\'entropie et génération', async ({ page }) => {
   60 |         // Clique sur le bouton "Générer"
   61 |         await page.click('#generate-button');
   62 |
   63 |         // Attendre que le texte de #random-number change (non vide, non "--", non "Chargement...")
   64 |         const randomNumberLocator = page.locator('#random-number');
   65 |         await expect(randomNumberLocator).not.toHaveText('--', { timeout: 10000 });
   66 |         await expect(randomNumberLocator).not.toHaveText('Chargement...', { timeout: 10000 });
   67 |         
   68 |         const randomNumberText = await randomNumberLocator.textContent();
   69 |         
   70 |         await expect(randomNumberText).not.toBeNull();
   71 |         await expect(randomNumberText).not.toBe('');
   72 |         await expect(randomNumberText).toMatch(/^[0-9a-fA-F]+$/);
   73 |     });
   74 |
   75 |     test('Erreur lors de la récupération des données de l\'API', async ({ page }) => {
   76 |         // Intercepter la requête /generate_random et simuler une erreur 500
   77 |         await page.route('**/generate_random', route => {
   78 |             route.fulfill({ status: 500, body: JSON.stringify({ error: 'Erreur simulée' }) });
   79 |         });
   80 |
   81 |         await page.goto('http://localhost:5173/'); 
   82 |         await page.click('#generate-button');
   83 |
   84 |         // Vérifier que le message d'erreur "Erreur" est affiché
   85 |         const randomNumberLocator = page.locator('#random-number');
   86 |         await expect(randomNumberLocator).toHaveText('Erreur', { timeout: 5000 });
   87 |     });
   88 |
   89 |     test('Outil Interne de Sécurité - Génération de token avec options', async ({ page }) => {
   90 |         // Naviguer vers l'outil interne
   91 |         await page.click('#nav-internal-tool');
   92 |         await page.waitForSelector('#internal-tool-interface', { state: 'visible' });
   93 |
   94 |         // Vérifier les champs par défaut
   95 |         const lengthInput = page.locator('#token-length');
   96 |         const includeLower = page.locator('#include-lowercase');
   97 |         const includeNumbers = page.locator('#include-numbers');
   98 |         const generateSecureButton = page.locator('#generate-secure-button');
   99 |         const generatedTokenDisplay = page.locator('#generated-token');
  100 |         const feedbackMessage = page.locator('#feedback-message');
  101 |
  102 |         await expect(lengthInput).toHaveValue('32');
  103 |         await expect(includeLower).toBeChecked();
  104 |         await expect(includeNumbers).toBeChecked();
  105 |         await expect(generateSecureButton).not.toBeDisabled();
  106 |
  107 |         // Générer un token avec les options par défaut
  108 |         await generateSecureButton.click();
  109 |         
  110 |         // Attendre que le token généré ne soit plus vide et ne soit pas "Génération en cours..."
  111 |         await expect(generatedTokenDisplay).not.toBeEmpty({ timeout: 5000 });
  112 |         await expect(generatedTokenDisplay).not.toHaveValue('Génération en cours...', { timeout: 5000 });
  113 |
  114 |         // Vérifier le message de succès
  115 |         await expect(feedbackMessage).toHaveText('Token généré avec succès.', { timeout: 5000 });
  116 |         
  117 |         // Utiliser .inputValue() pour lire le contenu de la textarea de manière fiable
  118 |         const generatedTokenText = await generatedTokenDisplay.inputValue(); // <-- CORRECTION ICI
  119 |         await expect(generatedTokenText).toMatch(/^[0-9a-zA-Z!@#$%^&*()-_=+\[\]{}|;:,.<>?'"`~]+$/); 
  120 |
  121 |         // Tester une composition spécifique : minuscules et chiffres, longueur 10
  122 |         await lengthInput.fill('10');
  123 |         await page.locator('#include-uppercase').uncheck();
  124 |         await page.locator('#include-symbols').uncheck();
  125 |         await generateSecureButton.click();
  126 |
  127 |         // Attendre que le token généré ne soit plus vide et ne soit pas "Génération en cours..."
  128 |         await expect(generatedTokenDisplay).not.toBeEmpty({ timeout: 5000 });
  129 |         await expect(generatedTokenDisplay).not.toHaveValue('Génération en cours...', { timeout: 5000 });
  130 |         
  131 |         // Vérifier le message de succès pour cette composition
  132 |         await expect(feedbackMessage).toHaveText('Token généré avec succès.', { timeout: 5000 });
  133 |
  134 |         const generatedTokenTextSpecific = await generatedTokenDisplay.inputValue(); // <-- CORRECTION ICI
  135 |         await expect(generatedTokenTextSpecific).toHaveLength(10);
  136 |         await expect(generatedTokenTextSpecific).toMatch(/^[0-9a-z]+$/); // Seulement minuscules et chiffres
```