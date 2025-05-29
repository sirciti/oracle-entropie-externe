// frontend/cubes_visualizer.js

import { THREE } from './three_utils.js'; // Import de Three.js via l'utilitaire partagé

let scene = null; 
let camera = null;
let renderer = null;
let cubesGroup = null; // Groupe pour contenir les cubes et les billes

let frames = [];
let currentFrame = 0;
let animationId = null; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Fonction d'initialisation de la scène Three.js pour les cubes
export function initCubesVisualizer(containerId) {
    console.log("INIT CUBES: 1. initCubesVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT CUBES ERROR: 2. Conteneur #${containerId} non trouvé pour le visualiseur de cubes.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: false };
    }
    console.log("INIT CUBES: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false; // Réinitialiser le drapeau
        console.log("INIT CUBES: 3. Animation précédente annulée.");
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    console.log("INIT CUBES: 4. Conteneur HTML nettoyé.");
    
    if (scene) {
        console.log("INIT CUBES: 5. Nettoyage objets scène existante.");
        scene.traverse(function(object) {
            if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) { // Inclure LineSegments pour wireframe
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
        console.log("INIT CUBES: 6. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales
    scene = null;
    camera = null;
    cubesGroup = null; // Réinitialiser le groupe de cubes
    console.log("INIT CUBES: 7. Variables Three.js globales réinitialisées.");


    // --- Recréation de la Scène, Caméra, Renderer ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);
    console.log("INIT CUBES: 8. Nouveau canvas créé et ajouté au conteneur:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 
    console.log("INIT CUBES: 9. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60, // FOV
        container.clientWidth / container.clientHeight,
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    // Position de la caméra ajustée pour voir un système de cubes de taille 8x8x8 dans un espace 30x30x30
    camera.position.set(0, 0, 40); // Assez loin sur Z pour voir la boîte de confinement
    camera.lookAt(0, 0, 0); 
    console.log("INIT CUBES: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT CUBES: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}`);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); 
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT CUBES: 12. Lumières ajoutées.");

    cubesGroup = new THREE.Group(); // Groupe pour contenir tous les cubes et leurs billes
    scene.add(cubesGroup);
    console.log("INIT CUBES: 13. cubesGroup créé et ajouté à la scène.");
    
    // --- Gestion du Redimensionnement ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE CUBES WARN: Conteneur a des dimensions zéro lors du resize.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE CUBES: Renderer.render appelé avec taille ${width}x${height}.`);
        } else {
            console.warn("RESIZE CUBES WARN: Resize appelé mais Three.js non prêt (container, renderer, ou camera null).");
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT CUBES: 15. Listeners de resize configurés et appel initial.");

    // --- Charger les données d'animation des cubes depuis le back-end ---
    // Les paramètres doivent correspondre à ceux de backend/geometry/cubes/generator.py
    fetch('http://127.0.0.1:5000/geometry/cubes/animate?steps=200&num_cubes=3&cube_size=8&num_balls_per_cube=3&space_bounds=30')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("FETCH CUBES SUCCESS: 16. Données reçues (fetch successful):", data); 
            frames = data.frames;
            currentFrame = 0; 
            if (frames.length > 0) {
                updateCubesGeometry(frames[0]); 
                // Forcer un rendu initial après la première mise à jour
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                    console.log("FETCH CUBES SUCCESS: 18. Rendu forcé après updateCubesGeometry.");
                }
            } else {
                console.warn("FETCH CUBES SUCCESS WARN: 19. Aucune frame d'animation reçue pour les cubes.");
            }
        })
        .catch(error => {
            console.error('FETCH CUBES ERROR: Erreur lors de la récupération des données d\'animation des cubes:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D des cubes.</p>';
            }
        });

    return {
        start: () => { 
            console.log("CONTROL CUBES: 20. start() appelé. animationId:", animationId);
            if (!isAnimatingFlag) { // Utilise le drapeau pour l'état de l'animation
                animateCubes(); 
                isAnimatingFlag = true; // Met le drapeau à true
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            console.log("CONTROL CUBES: 21. stop() appelé. animationId:", animationId);
            if (isAnimatingFlag) { 
                cancelAnimationFrame(animationId); 
                animationId = null; 
                isAnimatingFlag = false; // Met le drapeau à false
            } 
            if (cubesGroup) { // Utiliser cubesGroup pour le nettoyage
                 while (cubesGroup.children.length > 0) {
                    const child = cubesGroup.children[0];
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
                    cubesGroup.remove(child);
                }
            }
        },
        resize: () => { console.log("CONTROL CUBES: 22. resize() appelé."); onWindowResize(); },
        get isRunning() { return isAnimatingFlag; } // Expose l'état de l'animation
    };
}

// Fonction pour mettre à jour la géométrie des cubes pour une frame donnée
function updateCubesGeometry(frame) {
    console.log("UPDATE CUBES: 23. updateCubesGeometry appelée."); 
    if (!cubesGroup) {
        console.error("UPDATE CUBES ERROR: 24. cubesGroup non initialisé dans updateCubesGeometry.");
        return;
    }
    console.log("UPDATE CUBES: 25. cubesGroup contient", cubesGroup.children.length, "enfants avant nettoyage.");

    while (cubesGroup.children.length > 0) { // Nettoyer le groupe avant d'ajouter les nouvelles briques
        const child = cubesGroup.children[0];
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
        cubesGroup.remove(child);
    }
    console.log("UPDATE CUBES: 26. cubesGroup nettoyé. Contient", cubesGroup.children.length, "enfants.");

    if (!frame || !frame.cubes || !Array.isArray(frame.cubes)) {
        console.error("UPDATE CUBES ERROR: 27. Format de frame invalide pour les cubes:", frame);
        return;
    }

    let cubesAddedCount = 0;
    frame.cubes.forEach(cubeData => {
        if (!cubeData || cubeData.position === undefined || cubeData.size === undefined || 
            cubeData.rotation === undefined || cubeData.balls_positions === undefined) {
            console.warn("UPDATE CUBES WARN: 28. Données de cube invalides dans la frame:", cubeData);
            return;
        }

        const cubeSize = cubeData.size;
        // Cube en fil de fer blanc
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.position.set(cubeData.position[0], cubeData.position[1], cubeData.position[2]);
        
        // Appliquer la rotation du cube
        // Les rotations sont des angles d'Euler, on les convertit en radians
        cubeMesh.rotation.set(
            THREE.MathUtils.degToRad(cubeData.rotation[0]),
            THREE.MathUtils.degToRad(cubeData.rotation[1]),
            THREE.MathUtils.degToRad(cubeData.rotation[2])
        );

        cubesGroup.add(cubeMesh);
        cubesAddedCount++;

        // Ajouter les billes à l'intérieur du cube
        const ballRadius = cubeData.ball_radius || (cubeSize / 8.0); // Utiliser le rayon de la bille du backend
        const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Billes blanches

        if (cubeData.balls_positions && Array.isArray(cubeData.balls_positions)) {
            cubeData.balls_positions.forEach(ballPos => {
                const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
                const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
                ballMesh.position.set(ballPos[0], ballPos[1], ballPos[2]);
                cubeMesh.add(ballMesh); // Ajoute la bille comme enfant du cube (se déplace avec lui)
            });
        }
    });
    console.log("UPDATE CUBES: 29. Total cubes ajoutés au groupe:", cubesAddedCount);
    
    // Le groupe de cubes est déjà positionné à l'origine (0,0,0) dans le back-end.
    // La caméra est ajustée pour cette position.
    cubesGroup.position.set(0, 0, 0); 
    console.log("UPDATE CUBES: 30. cubesGroup position set à (0,0,0).");

    // DÉBUG: Afficher le bounding box du groupe pour vérifier sa taille réelle
    const box = new THREE.Box3().setFromObject(cubesGroup);
    console.log("UPDATE CUBES: Bounding Box du groupe:", box);
}

// Boucle d'animation pour les cubes
function animateCubes() {
    animationId = requestAnimationFrame(animateCubes);
    isAnimatingFlag = true;

    if (frames.length > 0) {
        currentFrame = (currentFrame + 1) % frames.length; // Boucle sur les frames
        updateCubesGeometry(frames[currentFrame]); // Met à jour la géométrie
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}