// frontend/pyramids_visualizer.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js";

let scene = null; 
let camera = null;
let renderer = null;
let pyramidsGroup = null; 

let frames = [];
let currentFrame = 0;
let animationId = null; 

// Fonction d'initialisation de la scène Three.js pour les pyramides
export function initPyramidsVisualizer(containerId) {
    console.log("INIT PYRA: 1. initPyramidsVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT PYRA ERROR: 2. Conteneur #${containerId} non trouvé pour le visualiseur de pyramides.`);
        return { start: () => {}, stop: () => {}, resize: () => {} };
    }
    console.log("INIT PYRA: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        console.log("INIT PYRA: 3. Animation précédente annulée.");
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    console.log("INIT PYRA: 4. Conteneur HTML nettoyé.");
    
    if (scene) {
        console.log("INIT PYRA: 5. Nettoyage objets scène existante.");
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
    if (renderer) {
        console.log("INIT PYRA: 6. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales
    scene = null;
    camera = null;
    pyramidsGroup = null;
    console.log("INIT PYRA: 7. Variables Three.js globales réinitialisées.");


    // --- Recréation de la Scène, Caméra, Renderer pour la nouvelle visualisation ---
    const newCanvas = document.createElement("canvas"); 
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
    // Position de la caméra (test de visibilité ultime)
    camera.position.set(0, 0, 40); // Assez loin sur Z pour englober tout le système
    camera.lookAt(0, 0, 0); 
    console.log("INIT PYRA: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT PYRA: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}`);

    // Lumières (rendues plus fortes pour le test ultime)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0); 
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
    window.removeEventListener("resize", onWindowResize); 
    window.addEventListener("resize", onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT PYRA: 15. Listeners de resize configurés et appel initial.");

    // --- Charger les données d'animation des pyramides depuis le back-end ---
    // Les paramètres base_size, num_layers, brick_size sont importants.
    // Utiliser des valeurs plus grandes pour que les pyramides soient bien visibles (pour le test)
    fetch("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2")
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
            console.error("FETCH PYRA ERROR: Erreur lors de la récupération des données d'animation des pyramides:", error);
            if (container) {
                container.innerHTML = "<p style=\"color: red; text-align: center;\">Erreur de chargement 3D des pyramides.</p>";
            }
        });

    return {
        start: () => { 
            if (!animationId) { 
                animatePyramids(); 
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            if (animationId) { 
                cancelAnimationFrame(animationId); 
                animationId = null; 
            } 
            if (pyramidsGroup) {
                 while (pyramidsGroup.children.length > 0) {
                    const child = pyramidsGroup.children[0];
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                    pyramidsGroup.remove(child);
                }
            }
        },
        resize: () => { onWindowResize(); } 
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

    while (pyramidsGroup.children.length > 0) {
        const child = pyramidsGroup.children[0];
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose(); 
            if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
            } else {
                child.material.dispose();
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

    // DÉBOGAGE: Facteur d'échelle pour la visibilité (pour le test ultime)
    const debugScaleFactor = 5; // Agrandir le système 5 fois pour une meilleure visibilité initiale

    // Couleurs distinctes pour les deux pyramides
    const pyramidColors = [0xff0000, 0x0000ff]; // Rouge pour pyramide 0, Bleu pour pyramide 1


    let bricksAddedCount = 0;
    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("UPDATE PYRA WARN: 30. Données de pyramide ou de briques invalides dans la frame:", pyramidData);
            return;
        }
        
        // Choisir la couleur de la pyramide en fonction de son ID
        const pyramidColor = pyramidColors[pyramidData.id % pyramidColors.length]; // Utilise l'ID pour la couleur

        pyramidData.bricks_positions.forEach(pos => {
            const brickGeometry = new THREE.BoxGeometry(actualBrickSize, actualBrickSize, actualBrickSize); 
            const brickMaterial = new THREE.MeshPhongMaterial({ color: pyramidColor }); // Utilise la couleur de la pyramide
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            
            // Appliquer le facteur d'échelle du débogage aux positions des briques
            brick.position.set(pos[0] * debugScaleFactor, pos[1] * debugScaleFactor, pos[2] * debugScaleFactor); 
            pyramidsGroup.add(brick);
            bricksAddedCount++;
        });
    });
    console.log("UPDATE PYRA: 31. Total briques ajoutées au groupe:", bricksAddedCount);
    
    // Le groupe est déjà centré à l'origine (0,0,0) dans le back-end.
    // La caméra est ajustée pour cette position.
    pyramidsGroup.position.set(0, 0, 0); // Laisser le groupe à l'origine, le scaling est sur le groupe lui-même
    console.log("UPDATE PYRA: 32. pyramidsGroup position set à (0,0,0).");

    // DÉBUG: Afficher le bounding box du groupe pour vérifier sa taille réelle
    const box = new THREE.Box3().setFromObject(pyramidsGroup);
    console.log("UPDATE PYRA: Bounding Box du groupe:", box);
}

// Boucle d'animation pour les pyramides
function animatePyramids() { 
    animationId = requestAnimationFrame(animatePyramids);

    if (frames.length > 0) {
        if (currentFrame < frames.length) {
            updatePyramidsGeometry(frames[currentFrame]);
            currentFrame++;
        } else {
            currentFrame = 0; // Boucler l'animation
        }
    }

    // Rotation globale du groupe de pyramides
    if (pyramidsGroup) {
        pyramidsGroup.rotation.x += 0.005;
        pyramidsGroup.rotation.y += 0.007;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}