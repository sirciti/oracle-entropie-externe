// frontend/src/visualizers/pyramids_visualizer.js

import { THREE } from "../utils/three_utils.js"; // <-- CORRECTION ICI

let scene = null; 
let camera = null;
let renderer = null;
let pyramidsGroup = null; // Groupe pour contenir les pyramides et les billes

let frames = [];
let currentFrame = 0;
let animationId = null; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Fonction d'initialisation de la scène Three.js pour les pyramides
export function initPyramidsVisualizer(containerId) {
    console.log("INIT PYRA: 1. initPyramidsVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT PYRA ERROR: 2. Conteneur #${containerId} non trouvé pour le visualiseur de pyramides.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    console.log("INIT PYRA: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false; // Réinitialiser le drapeau
        console.log("INIT PYRA: 3. Animation précédente annulée.");
    }

    while (container.firstChild) { // Nettoyer le conteneur HTML (retirer l'ancien canvas s'il y en a un)
        container.removeChild(container.firstChild);
    }
    console.log("INIT PYRA: 4. Conteneur HTML nettoyé.");
    
    if (scene) { // Nettoyer les objets de la scène précédente pour libérer la mémoire Three.js
        console.log("INIT PYRA: 5. Nettoyage objets scène existante.");
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
        console.log("INIT PYRA: 6. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales
    scene = null;
    camera = null;
    pyramidsGroup = null;
    frames = []; // Important: réinitialiser les frames aussi
    currentFrame = 0; // Important: réinitialiser la frame courante
    console.log("INIT PYRA: 7. Variables Three.js globales réinitialisées.");


    // --- Recréation de la Scène, Caméra, Renderer ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);
    console.log("INIT PYRA: 8. Nouveau canvas créé et ajouté au conteneur:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 
    console.log("INIT PYRA: 9. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60, // FOV
        container.clientWidth / container.clientHeight,
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    // Position de la caméra ajustée pour voir les pyramides qui sont centrées autour de (0,0,0)
    // Le système généré (base_size=10, brick_size=2) est d'environ 10x8x10 unités.
    // Une position de 0, 0, 20-30 devrait être bonne.
    camera.position.set(0, 0, 40); // Assez loin sur Z pour englober tout le système
    camera.lookAt(0, 0, 0); 
    console.log("INIT PYRA: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT PYRA: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}.`);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); 
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT PYRA: 12. Lumières ajoutées.");

    pyramidsGroup = new THREE.Group(); 
    scene.add(pyramidsGroup);
    console.log("INIT PYRA: 13. pyramidsGroup créé et ajouté à la scène.");
    
    // --- Gestion du Redimensionnement ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE PYRA WARN: Conteneur a des dimensions zéro lors du resize.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE PYRA: Renderer.render appelé avec taille ${width}x${height}.`);
        } else {
            console.warn("RESIZE PYRA WARN: Resize appelé mais Three.js non prêt (container, renderer, ou camera null).");
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT PYRA: 15. Listeners de resize configurés et appel initial.");

    // --- Charger les données d'animation des pyramides depuis le back-end ---
    // base_size=10, num_layers=5, brick_size=2 génère un système d'environ 10x8x10 unités.
    fetch('http://backend:8000/geometry/pyramids/initial')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("FETCH PYRA SUCCESS: 16. Données reçues (fetch successful):", data); 
            frames = data.frames;
            currentFrame = 0; 
            if (frames.length > 0) {
                updatePyramidsGeometry(frames[0]); 
                // Forcer un rendu initial après la première mise à jour
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                    console.log("FETCH PYRA SUCCESS: 18. Rendu forcé après updatePyramidsGeometry.");
                }
            } else {
                console.warn("FETCH PYRA SUCCESS WARN: 19. Aucune frame d'animation reçue pour les pyramides.");
            }
        })
        .catch(error => {
            console.error('FETCH PYRA ERROR: Erreur lors de la récupération des données d\'animation des pyramides:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D des pyramides.</p>';
            }
        });

    return {
        start: () => { 
            console.log("CONTROL PYRA: 20. start() appelé. animationId:", animationId);
            if (!isAnimatingFlag) { // Utilise le drapeau pour l'état de l'animation
                animatePyramids(); 
                isAnimatingFlag = true; // Met le drapeau à true
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            console.log("CONTROL PYRA: 21. stop() appelé. animationId:", animationId);
            if (isAnimatingFlag) { // Utilise le drapeau
                cancelAnimationFrame(animationId); 
                animationId = null; 
                isAnimatingFlag = false; // Met le drapeau à false
            } 
            if (pyramidsGroup) {
                 while (pyramidsGroup.children.length > 0) {
                    const child = pyramidsGroup.children[0];
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
                    pyramidsGroup.remove(child);
                }
            }
        },
        resize: () => { console.log("CONTROL PYRA: 22. resize() appelé."); onWindowResize(); },
        isRunning: () => isAnimatingFlag // Expose l'état de l'animation
    };
}

// Fonction pour mettre à jour la géométrie des pyramides pour une frame donnée
function updatePyramidsGeometry(frame) {
    console.log("UPDATE PYRA: 23. updatePyramidsGeometry appelée."); 
    if (!pyramidsGroup) {
        console.error("UPDATE PYRA ERROR: 24. pyramidsGroup non initialisé dans updatePyramidsGeometry.");
        return;
    }
    console.log("UPDATE PYRA: 25. pyramidsGroup contient", pyramidsGroup.children.length, "enfants avant nettoyage.");

    while (pyramidsGroup.children.length > 0) { // Nettoyer le groupe avant d'ajouter les nouvelles briques
        const child = pyramidsGroup.children[0];
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
        pyramidsGroup.remove(child);
    }
    console.log("UPDATE PYRA: 26. pyramidsGroup nettoyé. Contient", pyramidsGroup.children.length, "enfants.");

    if (!frame || !frame.pyramids || !Array.isArray(frame.pyramids)) {
        console.error("UPDATE PYRA ERROR: 27. Format de frame invalide pour les pyramides:", frame);
        return;
    }

    const actualBrickSize = (frame.pyramids[0] && frame.pyramids[0].brick_size !== undefined) ? frame.pyramids[0].brick_size : 1.0;
    console.log("UPDATE PYRA: 28. actualBrickSize:", actualBrickSize);

    // Facteur d'échelle pour la visibilité
    const displayScaleFactor = 5; 

    // Couleurs distinctes pour les deux pyramides
    const pyramidColors = [new THREE.Color(0xff0000), new THREE.Color(0x0000ff)]; // Rouge pour pyramide 0, Bleu pour pyramide 1

    // Matériau pour les billes (blanc)
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Billes blanches

    let bricksAddedCount = 0;
    let ballsAddedCount = 0;

    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("UPDATE PYRA WARN: 30. Données de pyramide ou de briques invalides dans la frame:", pyramidData);
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
            pyramidsGroup.add(brick);
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
                pyramidsGroup.add(ballMesh); // Ajoute la bille au groupe principal
                ballsAddedCount++;
            });
        }
    });
    console.log("UPDATE PYRA: 31. Total briques ajoutées au groupe:", bricksAddedCount, "Total billes ajoutées:", ballsAddedCount);
    
    pyramidsGroup.position.set(0, 0, 0); 
    console.log("UPDATE PYRA: 32. pyramidsGroup position set à (0,0,0).");

    // DÉBUG: Afficher le bounding box du groupe pour vérifier sa taille réelle
    const box = new THREE.Box3().setFromObject(pyramidsGroup);
    console.log("UPDATE PYRA: Bounding Box du groupe (échelle appliquée):", box);
}

// Boucle d'animation pour les pyramides
function animatePyramids() { 
    animationId = requestAnimationFrame(animatePyramids);
    isAnimatingFlag = true; // S'assurer que le drapeau est à true pendant l'animation

    if (frames.length > 0) {
        // CORRECTION : S'assurer que currentFrame n'est pas hors limites
        if (currentFrame >= frames.length) { // Si on a atteint la fin, on revient au début
            currentFrame = 0;
        }
        updatePyramidsGeometry(frames[currentFrame]); // Mise à jour de la géométrie pour la frame courante
        currentFrame++; // Passer à la frame suivante
    }

    if (pyramidsGroup) {
        pyramidsGroup.rotation.x += 0.005;
        pyramidsGroup.rotation.y += 0.007;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}