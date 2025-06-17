import * as THREE from "three";

let scene = null; 
let camera = null;
let renderer = null;
let spiral_torusGroup = null; // Groupe pour contenir les Spirale Toroïdale et les billes

let frames = [];
let currentFrame = 0;
let animationId = null; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Fonction d'initialisation de la scène Three.js pour les Spirale Toroïdale
export function initSpiralTorusVisualizer(containerId) {
    console.log("INIT SPIRAL_TORUS: 1. initSpiralTorusVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT SPIRAL_TORUS ERROR: 2. Conteneur #${containerId} non trouvé pour le visualiseur de Spirale Toroïdale.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    console.log("INIT SPIRAL_TORUS: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false; // Réinitialiser le drapeau
        console.log("INIT SPIRAL_TORUS: 3. Animation précédente annulée.");
    }

    while (container.firstChild) { // Nettoyer le conteneur HTML (retirer l'ancien canvas s'il y en a un)
        container.removeChild(container.firstChild);
    }
    console.log("INIT SPIRAL_TORUS: 4. Conteneur HTML nettoyé.");
    
    if (scene) { // Nettoyer les objets de la scène précédente pour libérer la mémoire Three.js
        console.log("INIT SPIRAL_TORUS: 5. Nettoyage objets scène existante.");
        scene.traverse(function(object) {
            if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
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
        console.log("INIT SPIRAL_TORUS: 6. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales
    scene = null;
    camera = null;
    spiral_torusGroup = null;
    frames = []; // Important: réinitialiser les frames aussi
    currentFrame = 0; // Important: réinitialiser la frame courante
    console.log("INIT SPIRAL_TORUS: 7. Variables Three.js globales réinitialisées.");


    // --- Recréation de la Scène, Caméra, Renderer ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);
    console.log("INIT SPIRAL_TORUS: 8. Nouveau canvas créé et ajouté au conteneur:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 
    console.log("INIT SPIRAL_TORUS: 9. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60, // FOV
        container.clientWidth / container.clientHeight,
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    // Position de la caméra ajustée pour voir les Spirale Toroïdale qui sont centrées autour de (0,0,0)
    // Le système généré (base_size=10, brick_size=2) est d'environ 10x8x10 unités.
    // Une position de 0, 0, 20-30 devrait être bonne.
    camera.position.set(0, 0, 40); // Assez loin sur Z pour englober tout le système
    camera.lookAt(0, 0, 0); 
    console.log("INIT SPIRAL_TORUS: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT SPIRAL_TORUS: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}.`);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); 
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT SPIRAL_TORUS: 12. Lumières ajoutées.");

    spiral_torusGroup = new THREE.Group(); 
    scene.add(spiral_torusGroup);
    console.log("INIT SPIRAL_TORUS: 13. spiral_torusGroup créé et ajouté à la scène.");
    
    // --- Gestion du Redimensionnement ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE SPIRAL_TORUS WARN: Conteneur a des dimensions zéro lors du resize.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE SPIRAL_TORUS: Renderer.render appelé avec taille ${width}x${height}.`);
        } else {
            console.warn("RESIZE SPIRAL_TORUS WARN: Resize appelé mais Three.js non prêt (container, renderer, ou camera null).");
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT SPIRAL_TORUS: 15. Listeners de resize configurés et appel initial.");

    // --- Charger les données d'animation des Spirale Toroïdale depuis le back-end ---
    // base_size=10, num_layers=5, brick_size=2 génère un système d'environ 10x8x10 unités.
    fetch("/toroidal_spiral/initial")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("FETCH SPIRAL_TORUS SUCCESS: 16. Données reçues (fetch successful):", data); 
            frames = data.frames;
            currentFrame = 0; 
            if (frames.length > 0) {
                updateSpiralTorusGeometry(frames[0]); 
                // Forcer un rendu initial après la première mise à jour
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                    console.log("FETCH SPIRAL_TORUS SUCCESS: 18. Rendu forcé après updateSpiralTorusGeometry.");
                }
            } else {
                console.warn("FETCH SPIRAL_TORUS SUCCESS WARN: 19. Aucune frame d'animation reçue pour les Spirale Toroïdale.");
            }
        })
        .catch(error => {
            console.error('FETCH SPIRAL_TORUS ERROR: Erreur lors de la récupération des données d\'animation des Spirale Toroïdale:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D des Spirale Toroïdale.</p>';
            }
        });

    return {
        start: () => { 
            console.log("CONTROL SPIRAL_TORUS: 20. start() appelé. animationId:", animationId);
            if (!isAnimatingFlag) { // Utilise le drapeau pour l'état de l'animation
                animateSpiralTorus(); 
                isAnimatingFlag = true; // Met le drapeau à true
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            console.log("CONTROL SPIRAL_TORUS: 21. stop() appelé. animationId:", animationId);
            if (isAnimatingFlag) { // Utilise le drapeau
                cancelAnimationFrame(animationId); 
                animationId = null; 
                isAnimatingFlag = false; // Met le drapeau à false
            } 
            if (spiral_torusGroup) {
                 while (spiral_torusGroup.children.length > 0) {
                    const child = spiral_torusGroup.children[0];
                    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(material => material.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                    spiral_torusGroup.remove(child);
                }
            }
        },
        resize: () => { console.log("CONTROL SPIRAL_TORUS: 22. resize() appelé."); onWindowResize(); },
        isRunning: () => isAnimatingFlag // Expose l'état de l'animation
    };
}

// Fonction pour mettre à jour la géométrie des Spirale Toroïdale pour une frame donnée
function updateSpiralTorusGeometry(frame) {
    console.log("UPDATE SPIRAL_TORUS: 23. updateSpiralTorusGeometry appelée."); 
    if (!spiral_torusGroup) {
        console.error("UPDATE SPIRAL_TORUS ERROR: 24. spiral_torusGroup non initialisé dans updateSpiralTorusGeometry.");
        return;
    }
    console.log("UPDATE SPIRAL_TORUS: 25. spiral_torusGroup contient", spiral_torusGroup.children.length, "enfants avant nettoyage.");

    while (spiral_torusGroup.children.length > 0) { // Nettoyer le groupe avant d'ajouter les nouvelles briques
        const child = spiral_torusGroup.children[0];
        // Assurez-vous de disposer les géométries et matériaux pour libérer la mémoire
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            if (child.geometry) child.geometry.dispose(); 
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
        spiral_torusGroup.remove(child);
    }
    console.log("UPDATE SPIRAL_TORUS: 26. spiral_torusGroup nettoyé. Contient", spiral_torusGroup.children.length, "enfants.");

    if (!frame || !frame.spiral_torus || !Array.isArray(frame.spiral_torus)) {
        console.error("UPDATE SPIRAL_TORUS ERROR: 27. Format de frame invalide pour les Spirale Toroïdale:", frame);
        return;
    }

    const actualBrickSize = (frame.spiral_torus[0] && frame.spiral_torus[0].brick_size !== undefined) ? frame.spiral_torus[0].brick_size : 1.0;
    console.log("UPDATE SPIRAL_TORUS: 28. actualBrickSize:", actualBrickSize);

    // Facteur d'échelle pour la visibilité
    const displayScaleFactor = 5; 

    // Couleurs distinctes pour les deux Spirale Toroïdale
    const pyramidColors = [new THREE.Color(0xff0000), new THREE.Color(0x0000ff)]; // Rouge pour pyramide 0, Bleu pour pyramide 1

    // Matériau pour les billes (blanc)
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Billes blanches

    let bricksAddedCount = 0;
    let ballsAddedCount = 0;

    frame.spiral_torus.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("UPDATE SPIRAL_TORUS WARN: 30. Données de pyramide ou de briques invalides dans la frame:", pyramidData);
            return;
        }
        
        // Choisir la couleur de la pyramide en fonction de son ID
        const pyramidColor = pyramidColors[pyramidData.id % pyramidColors.length]; 
        const brickMaterial = new THREE.MeshPhongMaterial({ color: pyramidColor }); 

        // Rendu des briques
        pyramidData.bricks_positions.forEach(pos => {
            const brickGeometry = new THREE.BoxGeometry(actualBrickSize, actualBrickSize, actualBrickSize); 
            const brick = new THREE.Mesh(brickGeometry, brickMaterial); 
            
            // Appliquer le facteur d'échelle à la position de la brique
            brick.position.set(pos[0] * displayScaleFactor, pos[1] * displayScaleFactor, pos[2] * displayScaleFactor); 
            spiral_torusGroup.add(brick);
            bricksAddedCount++;

            // Ajouter le fil de fer blanc
            const wireframeGeometry = new THREE.EdgesGeometry(brickGeometry); 
            const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }); 
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            brick.add(wireframe); // Le fil de fer est enfant de la brique et bouge avec elle
        });

        // Ajouter les billes
        if (pyramidData.balls && Array.isArray(pyramidData.balls)) {
            pyramidData.balls.forEach(ballPos => {
                const ballRadius = pyramidData.ball_radius || (actualBrickSize / 3.0); 
                const ballGeometry = new THREE.SphereGeometry(ballRadius * displayScaleFactor, 32, 32); 
                const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
                ballMesh.position.set(ballPos[0] * displayScaleFactor, ballPos[1] * displayScaleFactor, ballPos[2] * displayScaleFactor);
                spiral_torusGroup.add(ballMesh); // Ajoute la bille au groupe principal
                ballsAddedCount++;
            });
        }
    });
    console.log("UPDATE SPIRAL_TORUS: 31. Total briques ajoutées au groupe:", bricksAddedCount, "Total billes ajoutées:", ballsAddedCount);
    
    spiral_torusGroup.position.set(0, 0, 0); 
    console.log("UPDATE SPIRAL_TORUS: 32. spiral_torusGroup position set à (0,0,0).");

    // DÉBUG: Afficher le bounding box du groupe pour vérifier sa taille réelle
    const box = new THREE.Box3().setFromObject(spiral_torusGroup);
    console.log("UPDATE SPIRAL_TORUS: Bounding Box du groupe (échelle appliquée):", box);
}

// Boucle d'animation pour les Spirale Toroïdale
function animateSpiralTorus() { 
    animationId = requestAnimationFrame(animateSpiralTorus);
    isAnimatingFlag = true; // S'assurer que le drapeau est à true pendant l'animation

    if (frames.length > 0) {
        // CORRECTION : S'assurer que currentFrame n'est pas hors limites
        if (currentFrame >= frames.length) { // Si on a atteint la fin, on revient au début
            currentFrame = 0;
        }
        updateSpiralTorusGeometry(frames[currentFrame]); // Mise à jour de la géométrie pour la frame courante
        currentFrame++; // Passer à la frame suivante
    }

    if (spiral_torusGroup) {
        spiral_torusGroup.rotation.x += 0.005;
        spiral_torusGroup.rotation.y += 0.007;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}