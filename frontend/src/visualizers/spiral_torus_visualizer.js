import * as THREE from "three";

let scene = null; 
let camera = null;
let renderer = null;
let spiral_torusGroup = null; // Groupe pour contenir les Spirale Toroïdale et les billes

let frames = [];
let currentFrame = 0;
let animationId = null; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Ajoute ces variables juste après la création de spiral_torusGroup :
let spiralPosition = new THREE.Vector3(0, 0, 0);
let spiralVelocity = new THREE.Vector3(0.02, 0.03, 0.01);
let spiralRotation = new THREE.Vector3(0, 0, 0);
let spiralRotationSpeed = new THREE.Vector3(0.005, 0.008, 0.012);
let luminescenceIndex = 0;
const luminescenceSpeed = 0.3;

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
    camera.position.set(0, 5, 25);
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

    // Nettoyage du groupe
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

    // Calcul du centre
    let centerX = 0, centerY = 0, centerZ = 0;
    points.forEach(point => {
        centerX += point.position[0];
        centerY += point.position[1];
        centerZ += point.position[2];
    });
    centerX /= points.length;
    centerY /= points.length;
    centerZ /= points.length;

    // Calcul de l'échelle et de l'espacement
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

    // Facteurs optimisés
    const scaleFactor = maxDistance > 0 ? 12 / maxDistance : 1;
    const spacingFactor = 2.5;

    // Géométries plus petites
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);

    centeredPositions.forEach((point, index) => {
        const geometry = point.type === "cube" ? cubeGeometry : sphereGeometry;
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(point.color[0], point.color[1], point.color[2]),
            emissive: 0x000000,
            emissiveIntensity: 0,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
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

    // Centrage automatique dans la viewport
    function centerGroupInViewport() {
        if (spiral_torusGroup.children.length === 0) return;
        const box = new THREE.Box3().setFromObject(spiral_torusGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        console.log("SPIRAL_TORUS: Centrage - center:", center, "size:", size);
        spiral_torusGroup.position.set(-center.x, -center.y, -center.z);
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 15) {
            const scale = 15 / maxDimension;
            spiral_torusGroup.scale.setScalar(scale);
            console.log("SPIRAL_TORUS: Échelle appliquée:", scale);
        }
    }
    centerGroupInViewport();

    console.log("SPIRAL_TORUS: Objets optimisés et centrés. Total:", points.length);
}

// Boucle d'animation pour les Spirale Toroïdale
function animateSpiralTorus() {
    if (!animationId) return;

    // IMPORTANT : Utiliser requestAnimationFrame correctement
    animationId = requestAnimationFrame(animateSpiralTorus);

    if (spiral_torusGroup) {
        // NOUVELLES AMÉLIORATIONS au lieu de la rotation basique
        updateMovementAndLuminescence();
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Mouvement et Luminescence
function updateMovementAndLuminescence() {
    if (!spiral_torusGroup) return;
    
    // ROTATION COMPLEXE sur 3 axes
    spiralRotation.add(spiralRotationSpeed);
    spiral_torusGroup.rotation.set(spiralRotation.x, spiralRotation.y, spiralRotation.z);
    
    // MOUVEMENT AVEC INERTIE
    spiralPosition.add(spiralVelocity);
    spiral_torusGroup.position.copy(spiralPosition);
    
    // REBONDS aux limites
    const containerLimits = { x: 15, y: 12, z: 12 };
    if (Math.abs(spiralPosition.x) > containerLimits.x) {
        spiralVelocity.x *= -0.9;
        spiralPosition.x = Math.sign(spiralPosition.x) * containerLimits.x;
    }
    if (Math.abs(spiralPosition.y) > containerLimits.y) {
        spiralVelocity.y *= -0.9;
        spiralPosition.y = Math.sign(spiralPosition.y) * containerLimits.y;
    }
    if (Math.abs(spiralPosition.z) > containerLimits.z) {
        spiralVelocity.z *= -0.9;
        spiralPosition.z = Math.sign(spiralPosition.z) * containerLimits.z;
    }
    
    // LUMINESCENCE SÉQUENTIELLE dorée
    const meshes = spiral_torusGroup.children;
    
    // Réinitialiser toutes les luminescences
    meshes.forEach(mesh => {
        if (mesh.material && mesh.material.emissive) {
            mesh.material.emissive.setHex(0x000000);
            mesh.material.emissiveIntensity = 0;
        }
    });
    
    // Activer la luminescence courante
    luminescenceIndex += luminescenceSpeed;
    const currentIndex = Math.floor(luminescenceIndex) % meshes.length;
    const currentMesh = meshes[currentIndex];
    
    if (currentMesh && currentMesh.material && currentMesh.material.emissive) {
        // Couleur dorée pour le torus
        currentMesh.material.emissive.setHex(0xffd700);
        currentMesh.material.emissiveIntensity = 1.2;
        
        // EFFET DE TRAÎNÉE sur 4 objets précédents
        for (let i = 1; i <= 4; i++) {
            const trailIndex = (currentIndex - i + meshes.length) % meshes.length;
            const trailMesh = meshes[trailIndex];
            if (trailMesh && trailMesh.material && trailMesh.material.emissive) {
                trailMesh.material.emissive.setHex(0x444444);
                trailMesh.material.emissiveIntensity = 0.4 / i;
            }
        }
    }
    
    console.log("SPIRAL_TORUS: Animation frame avec luminescence index:", currentIndex);
}