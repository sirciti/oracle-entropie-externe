import * as THREE from "three";
// frontend/src/visualizers/stream_visualizer.js


let scene = null;
let camera = null;
let renderer = null;
let streamGroup = null; // Groupe pour la visualisation du flux
let storageFillMesh = null; // Mesh pour représenter le remplissage du stockage
let streamTextElement = null; // Element HTML pour le texte du flux

let streamTokens = []; // Buffer pour les tokens reçus
let currentTokenIndex = 0;
let animationId = null;
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Paramètres de visualisation du stockage (valeurs initiales du HTML)
const STORAGE_CAPACITY_KB_DEFAULT = 1024; // Capacité visuelle totale par défaut en Ko (1 Mo)
const BYTES_PER_TOKEN_CHAR = 0.5; // Estimation: 0.5 octet par caractère hexadécimal (1 octet = 2 chars hex)
let currentFilledBytes = 0; // Quantité de stockage remplie (en octets, sera convertie en Ko pour affichage)
let targetCapacityBytes = STORAGE_CAPACITY_KB_DEFAULT * 1024; // Capacité cible en octets

// Fonction pour arrêter l'animation du flux (déclarée une seule fois ici)
function stopAnimation() {
    cancelAnimationFrame(animationId);
    animationId = null;
    isAnimatingFlag = false;
    // Réinitialiser la visualisation du remplissage
    currentFilledBytes = 0;
    if (storageFillMesh) storageFillMesh.scale.y = 0.001;
    if (storageFillMesh) storageFillMesh.position.y = -storageFillMesh.geometry.parameters.height / 2;

    const startButton = document.getElementById('start-stream-button');
    if(startButton) startButton.textContent = "Démarrer Flux";
}


// Fonction pour mettre à jour la visualisation du flux et du remplissage
function animateStream() {
    if (!isAnimatingFlag) return;
    animationId = requestAnimationFrame(animateStream);

    // Si le buffer de tokens est vide, tenter de demander plus (si l'animation est toujours active)
    if (currentTokenIndex >= streamTokens.length && isAnimatingFlag) {
        const streamLengthInput = document.getElementById('stream-length');
        const streamCapacityInput = document.getElementById('stream-capacity');
        const tokenLength = parseInt(streamLengthInput.value, 10);
        const totalCapacityBytes = parseInt(streamCapacityInput.value, 10) * 1024;
        
        // Fetch plus de tokens seulement si on n'a pas atteint la capacité maximale
        if (currentFilledBytes < totalCapacityBytes) {
             fetchMoreTokens(tokenLength, {
                lowercase: document.getElementById('stream-lowercase').checked,
                uppercase: document.getElementById('stream-uppercase').checked,
                numbers: document.getElementById('stream-numbers').checked,
                symbols: document.getElementById('stream-symbols').checked
            }, totalCapacityBytes);
            currentTokenIndex = 0; // Réinitialiser l'index pour parcourir les nouveaux tokens
        } else {
            // Si la capacité maximale est atteinte, arrêter l'animation
            stopAnimation();
            const startButton = document.getElementById('start-stream-button');
            if(startButton) startButton.textContent = "Démarrer Flux";
            const feedbackStream = document.getElementById('feedback-stream');
            if(feedbackStream) {
                feedbackStream.textContent = "Capacité de stockage atteinte.";
                feedbackStream.style.color = "lightgreen";
            }
            return; // Sortir de la boucle d'animation
        }
    }

    // Afficher le token actuel et mettre à jour le remplissage
    if (streamTokens.length > 0 && currentTokenIndex < streamTokens.length) {
        const token = streamTokens[currentTokenIndex];
        if (streamTextElement) {
            streamTextElement.value += token + "\n";
            streamTextElement.scrollTop = streamTextElement.scrollHeight; // Scroll automatique
        }

        const tokenBytes = token.length * BYTES_PER_TOKEN_CHAR; // Calcul de la taille du token en octets
        currentFilledBytes += tokenBytes; 

        // Mettre à jour la barre de remplissage 3D
        // Assurez-vous que storageFillMesh est initialisé
        if (storageFillMesh) {
            const totalCapacityBytes = parseInt(document.getElementById('stream-capacity').value, 10) * 1024;
            const fillPercentage = currentFilledBytes / totalCapacityBytes;
            storageFillMesh.scale.y = Math.min(1.0, fillPercentage); // Remplir jusqu'à 100%
            // Ajuster la position Y pour que ça remplisse du bas vers le haut
            storageFillMesh.position.y = -storageFillMesh.geometry.parameters.height / 2 + (storageFillMesh.geometry.parameters.height / 2) * storageFillMesh.scale.y;
        }

        currentTokenIndex++;
    } else if (isAnimatingFlag && currentTokenIndex >= streamTokens.length && currentFilledBytes < targetCapacityBytes) {
         // Si plus de tokens dans le buffer mais que la capacité n'est pas atteinte, on demande plus.
         // Ceci est déjà géré par la logique au début de animateStream()
         // On peut aussi ajouter un petit délai ici pour ne pas spammer le backend.
    }


    // Rotation globale du groupe
    if (streamGroup) {
        streamGroup.rotation.y += 0.002;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Fonction d'initialisation principale de la scène Three.js pour le flux de tokens
export function initStreamVisualizer(containerId) {
    console.log("INIT STREAM: 1. initStreamVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT STREAM ERROR: 2. Conteneur #${containerId} non trouvé pour le visualiseur de flux.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    console.log("INIT STREAM: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false; // Réinitialiser le drapeau
        console.log("INIT STREAM: 3. Animation précédente annulée.");
    }

    while (container.firstChild) { // Nettoyer le conteneur HTML (retirer l'ancien canvas s'il y en a un)
        container.removeChild(container.firstChild);
    }
    console.log("INIT STREAM: 4. Conteneur HTML nettoyé.");
    
    if (scene) { // Nettoyer les objets de la scène précédente pour libérer la mémoire Three.js
        console.log("INIT STREAM: 5. Nettoyage objets scène existante.");
        scene.traverse(function(object) {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    }
    if (renderer) { // Nettoyer le renderer aussi
        console.log("INIT STREAM: 6. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales spécifiques au stream
    scene = null;
    camera = null;
    streamGroup = null;
    storageFillMesh = null;
    streamTokens = [];
    currentTokenIndex = 0;
    currentFilledBytes = 0;
    console.log("INIT STREAM: 7. Variables Three.js globales réinitialisées.");


    // --- Recréation de la scène, caméra, renderer ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);
    console.log("INIT STREAM: 8. Nouveau canvas créé et ajouté au conteneur:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 

    camera = new THREE.PerspectiveCamera(
        60, 
        container.clientWidth / container.clientHeight,
        0.1, 
        1000 
    );
    // Position de la caméra pour voir la visualisation du stockage
    camera.position.set(0, 5, 30); 
    camera.lookAt(0, 0, 0); 
    console.log("INIT STREAM: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT STREAM: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}.`);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); 
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT STREAM: 12. Lumières ajoutées.");

    streamGroup = new THREE.Group(); 
    scene.add(streamGroup);
    console.log("INIT STREAM: 13. streamGroup créé et ajouté à la scène.");

    // --- Visualisation de l'espace de stockage ---
    // Représenter l'espace de stockage comme un grand cube transparent (le "disque dur")
    const storageOutlineGeometry = new THREE.BoxGeometry(20, 15, 5); // Taille du "disque"
    const storageOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.3 });
    const storageOutlineMesh = new THREE.Mesh(storageOutlineGeometry, storageOutlineMaterial);
    streamGroup.add(storageOutlineMesh);

    // Mesh pour le remplissage (initialisé à zéro)
    const fillGeometry = new THREE.BoxGeometry(18, 13, 4); // Légèrement plus petit que l'outline
    const fillMaterial = new THREE.MeshPhongMaterial({ color: 0x0077ff }); // Bleu pour le remplissage
    storageFillMesh = new THREE.Mesh(fillGeometry, fillMaterial);
    storageFillMesh.position.y = -fillGeometry.parameters.height / 2; // Commencer du bas
    storageFillMesh.scale.y = 0.001; // Initialiser à presque zéro
    streamGroup.add(storageFillMesh);
    console.log("INIT STREAM: 14. Visualisation du stockage créée.");
    
    // --- Gestion du Redimensionnement ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE STREAM WARN: Conteneur a des dimensions zéro lors du resize.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE STREAM: Renderer.render appelé avec taille ${width}x${height}.`);
        } else {
            console.warn("RESIZE STREAM WARN: Resize appelé mais Three.js non prêt (container, renderer, ou camera null).");
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT STREAM: 15. Listeners de resize configurés et appel initial.");

    // --- Récupérer les éléments HTML pour les contrôles et l'affichage du texte ---
    const startButton = document.getElementById('start-stream-button');
    const streamLengthInput = document.getElementById('stream-length');
    const streamCapacityInput = document.getElementById('stream-capacity');
    const streamLowercase = document.getElementById('stream-lowercase');
    const streamUppercase = document.getElementById('stream-uppercase');
    const streamNumbers = document.getElementById('stream-numbers');
    const streamSymbols = document.getElementById('stream-symbols');
    streamTextElement = document.getElementById('generated-stream-output'); // Textarea pour le flux
    const feedbackStream = document.getElementById('feedback-stream');

    // Mettre à jour la capacité cible en octets (du default ou de l'input si déjà là)
    if (streamCapacityInput) {
        targetCapacityBytes = parseInt(streamCapacityInput.value, 10) * 1024; // Convertir Ko en octets
    }
    // Assurez-vous que l'écouteur pour la capacité est aussi géré
    streamCapacityInput.addEventListener('input', () => {
        targetCapacityBytes = parseInt(streamCapacityInput.value, 10) * 1024;
        // Réinitialiser le remplissage visuel si la capacité change
        currentFilledBytes = 0;
        if (storageFillMesh) storageFillMesh.scale.y = 0.001;
        if (storageFillMesh) storageFillMesh.position.y = -storageFillMesh.geometry.parameters.height / 2;
    });


    // --- Gestion du bouton Démarrer Flux ---
    if (startButton) {
        startButton.addEventListener('click', async () => {
            if (isAnimatingFlag) { // Si déjà en cours, arrêter
                stopAnimation();
                startButton.textContent = "Démarrer Flux";
                feedbackStream.textContent = "Flux arrêté.";
                feedbackStream.style.color = "orange";
                return;
            }

            // Validation des inputs
            const length = parseInt(streamLengthInput.value, 10);
            const capacity = parseInt(streamCapacityInput.value, 10); // En Ko
            const charOptions = {
                lowercase: streamLowercase.checked,
                uppercase: streamUppercase.checked,
                numbers: streamNumbers.checked,
                symbols: streamSymbols.checked
            };
            const charTypesSelected = [streamLowercase, streamUppercase, streamNumbers, streamSymbols].filter(cb => cb.checked).length;


            if (isNaN(length) || length < 8 || length > 128) {
                feedbackStream.textContent = "Longueur de token invalide (8-128).";
                feedbackStream.style.color = "#f44336";
                return;
            }
            if (isNaN(capacity) || capacity < 1 || capacity > 102400) {
                feedbackStream.textContent = "Capacité invalide (1-102400 Ko).";
                feedbackStream.style.color = "#f44336";
                return;
            }
            if (charTypesSelected === 0) {
                feedbackStream.textContent = "Sélectionnez au moins un type de caractère.";
                feedbackStream.style.color = "#f44336";
                return;
            }
            if (length < charTypesSelected) {
                feedbackStream.textContent = `Longueur (${length}) trop courte pour ${charTypesSelected} types de caractères.`;
                feedbackStream.style.color = "#f44336";
                return;
            }


            // Réinitialiser la visualisation
            streamTokens = [];
            currentTokenIndex = 0;
            currentFilledBytes = 0;
            if (streamTextElement) streamTextElement.value = "";
            if (storageFillMesh) storageFillMesh.scale.y = 0.001; // Vider la barre de remplissage
            if (storageFillMesh) storageFillMesh.position.y = -storageFillMesh.geometry.parameters.height / 2;
            feedbackStream.textContent = "Démarrage du flux...";
            feedbackStream.style.color = "white";
            startButton.textContent = "Arrêter Flux";

            isAnimatingFlag = true;
            animateStream(); // Démarrer la boucle d'animation

            // Requête au backend pour obtenir le flux initial
            await fetchMoreTokens(length, charOptions, capacity * 1024); // Capacité en octets

        });
    }


    return {
        start: () => { 
            isAnimatingFlag = true;
            animateStream();
            const startButton = document.getElementById('start-stream-button');
            if(startButton) startButton.textContent = "Arrêter Flux"; // Mettre à jour le texte du bouton
        },
        stop: stopAnimation, // Utilise la fonction stopAnimation définie localement
        resize: onWindowResize,
        isRunning: () => isAnimatingFlag 
    };
}