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
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    // Position de la caméra ajustée pour voir les Spirale Toroïdale qui sont centrées autour de (0,0,0)
    // Le système généré (base_size=10, brick_size=2) est d'environ 10x8x10 unités.
    // Une position de 0, 0, 20-30 devrait être bonne.
    camera.position.set(0, 0, 20); // Plus proche
    camera.lookAt(0, 0, 0);
    console.log("SPIRAL_TORUS: Caméra positionnée pour un meilleur angle de vue:", camera.position);

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
    fetch("/api/geometry/spiral_torus/animate")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("FETCH SPIRAL_TORUS SUCCESS:", data); 
            frames = data.frames;
            currentFrame = 0; 
            if (frames.length > 0) {
                updateSpiralTorusGeometry(frames[0]); 
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                }
                // 3. Forcer le démarrage de l'animation
                console.log("SPIRAL_TORUS: Forçage démarrage animation");
                animateSpiralTorus();
            } else {
                console.warn("FETCH SPIRAL_TORUS SUCCESS WARN: Aucune frame d'animation reçue.");
            }
        })
        .catch(error => {
            console.error('FETCH SPIRAL_TORUS ERROR:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D des Spirale Toroïdale.</p>';
            }
        });

    return {
        start: () => {
            console.log("CONTROL SPIRAL_TORUS: start() appelé. animationId:", animationId);
            if (!animationId) {
                animationId = true; // Marquer comme actif
                animateSpiralTorus();
            }
        },
        stop: () => {
            console.log("CONTROL SPIRAL_TORUS: stop() appelé. animationId:", animationId);
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        },
        resize: () => { console.log("CONTROL SPIRAL_TORUS: resize() appelé."); onWindowResize(); },
        isRunning: () => !!animationId
    };
}

// Fonction pour mettre à jour la géométrie des Spirale Toroïdale pour une frame donnée
// 1. Vérifier la taille des objets et 2. le facteur d'échelle
function updateSpiralTorusGeometry(frame) {
    console.log("UPDATE SPIRAL_TORUS: updateSpiralTorusGeometry appelée."); 
    if (!spiral_torusGroup) {
        console.error("UPDATE SPIRAL_TORUS ERROR: spiral_torusGroup non initialisé.");
        return;
    }

    // Nettoyer le groupe
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

    if (!frame || !frame.spiral || !frame.spiral.points) {
        console.error("UPDATE SPIRAL_TORUS ERROR: Format de frame invalide:", frame);
        return;
    }

    const points = frame.spiral.points;
    console.log("Points spirale torus à afficher:", points.length);

    // ÉTAPE 1 : Calculer le centre et recentrer
    let centerX = 0, centerY = 0, centerZ = 0;
    points.forEach(point => {
        centerX += point.position[0];
        centerY += point.position[1];
        centerZ += point.position[2];
    });
    centerX /= points.length;
    centerY /= points.length;
    centerZ /= points.length;

    // ÉTAPE 2 : Calculer l'échelle et l'espacement optimal
    let maxDistance = 0;
    const centeredPositions = points.map(point => {
        const centered = [
            point.position[0] - centerX,
            point.position[1] - centerY,
            point.position[2] - centerZ
        ];
        const distance = Math.sqrt(centered[0]**2 + centered[1]**2 + centered[2]**2);
        maxDistance = Math.max(maxDistance, distance);
        return { ...point, centeredPosition: centered };
    });

    // Facteur d'échelle pour tenir dans un rayon de 10 unités
    const scaleFactor = maxDistance > 0 ? 10 / maxDistance : 1;
    
    // ÉTAPE 3 : Facteur d'espacement pour éviter chevauchement
    const spacingFactor = 1.8; // Augmenter l'espacement de 80%

    console.log("SPIRAL_TORUS: Centre calculé:", [centerX, centerY, centerZ]);
    console.log("SPIRAL_TORUS: Échelle finale:", scaleFactor * spacingFactor);

    // ÉTAPE 4 : Créer les objets avec positions optimisées
    centeredPositions.forEach((point, index) => {
        let geometry;
        if (point.type === "cube") {
            geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        } else {
            geometry = new THREE.SphereGeometry(0.6, 16, 16);
        }
        
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(point.color[0], point.color[1], point.color[2]),
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position finale : centrée + mise à l'échelle + espacement
        const finalScale = scaleFactor * spacingFactor;
        mesh.position.set(
            point.centeredPosition[0] * finalScale,
            point.centeredPosition[1] * finalScale,
            point.centeredPosition[2] * finalScale
        );
        
        mesh.userData = { 
            originalColor: new THREE.Color(point.color[0], point.color[1], point.color[2]),
            pointIndex: index 
        };
        
        spiral_torusGroup.add(mesh);
    });

    console.log("SPIRAL_TORUS: Objets recentrés et redimensionnés. Total objets ajoutés:", points.length);
    console.log("SPIRAL_TORUS: Premier objet position:", spiral_torusGroup.children[0]?.position);
    console.log("SPIRAL_TORUS: Dernier objet position:", spiral_torusGroup.children[spiral_torusGroup.children.length-1]?.position);
}

// Boucle d'animation pour les Spirale Toroïdale
function animateSpiralTorus() {
    if (!animationId) return;

    // IMPORTANT : Utiliser requestAnimationFrame correctement
    animationId = requestAnimationFrame(animateSpiralTorus);

    if (spiral_torusGroup) {
        // Améliorations ajoutées
        updateMovementAndLuminescence();
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Luminescence
let luminescenceIndex = 0;
const luminescenceSpeed = 0.3;

let spiralPosition = new THREE.Vector3(0, 0, 0);
let spiralVelocity = new THREE.Vector3(0.02, 0.03, 0.01);
let spiralRotation = new THREE.Vector3(0, 0, 0);
let spiralRotationSpeed = new THREE.Vector3(0.005, 0.008, 0.012);

function updateMovementAndLuminescence() {
    // Rotation complexe sur 3 axes
    spiralRotation.add(spiralRotationSpeed);
    spiral_torusGroup.rotation.set(spiralRotation.x, spiralRotation.y, spiralRotation.z);

    // Mouvement avec inertie
    spiralPosition.add(spiralVelocity);
    spiral_torusGroup.position.copy(spiralPosition);

    // Rebonds aux limites
    const containerLimits = { x: 20, y: 15, z: 15 };
    if (Math.abs(spiralPosition.x) > containerLimits.x) {
        spiralVelocity.x *= -1;
        spiralPosition.x = Math.sign(spiralPosition.x) * containerLimits.x;
    }
    if (Math.abs(spiralPosition.y) > containerLimits.y) {
        spiralVelocity.y *= -1;
        spiralPosition.y = Math.sign(spiralPosition.y) * containerLimits.y;
    }
    if (Math.abs(spiralPosition.z) > containerLimits.z) {
        spiralVelocity.z *= -1;
        spiralPosition.z = Math.sign(spiralPosition.z) * containerLimits.z;
    }

    // Luminescence séquentielle dorée
    const meshes = spiral_torusGroup.children;
    meshes.forEach(mesh => {
        if (mesh.material && mesh.material.emissive) {
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
        }
    });

    luminescenceIndex += luminescenceSpeed;
    const currentIndex = Math.floor(luminescenceIndex) % meshes.length;
    const currentMesh = meshes[currentIndex];
    if (currentMesh && currentMesh.material && currentMesh.material.emissive) {
        currentMesh.material.emissive.setHex(0xffd700);
        currentMesh.material.emissiveIntensity = 1.0;

        // Effet de traînée
        for (let i = 1; i <= 3; i++) {
            const trailIndex = (currentIndex - i + meshes.length) % meshes.length;
            const trailMesh = meshes[trailIndex];
            if (trailMesh && trailMesh.material && trailMesh.material.emissive) {
                trailMesh.material.emissive.setHex(0x444444);
                trailMesh.material.emissiveIntensity = 0.3 / i;
            }
        }
    }
}