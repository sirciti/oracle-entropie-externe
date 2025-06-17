import * as THREE from "three";
// frontend/src/visualizer./icosahedron_visualizer.js


let scene = null;
let camera = null;
let renderer = null;
let icosahedronMesh = null; // Le mesh de l'icosaèdre
let frames = [];
let currentFrame = 0;
let animationId = null; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler
let isAnimatingFlag = false; // Drapeau pour l'état de l'animation

// Fonction d'initialisation de la scène Three.js pour l'icosaèdre
// Elle est exportée pour être appelée par navigation.js
export function initIcosahedronVisualizer(containerId) {
    console.log("INIT ICOSA: 1. initIcosahedronVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT ICOSA ERROR: Conteneur #${containerId} non trouvé pour le visualiseur d'icosaèdre.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    
    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    // Annule l'animation précédente si elle était en cours
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false; // Réinitialiser le drapeau
        console.log("INIT ICOSA: 2. Animation précédente annulée.");
    }

    // Nettoyer le conteneur HTML (retirer l'ancien canvas s'il y en a un)
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    console.log("INIT ICOSA: 3. Conteneur HTML nettoyé.");
    
    if (scene) { // Nettoyer les objets de la scène précédente pour libérer la mémoire Three.js
        console.log("INIT ICOSA: 4. Nettoyage objets scène existante.");
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
    // Nettoyer le renderer aussi
    if (renderer) {
        console.log("INIT ICOSA: 5. Renderer existant disposé.");
        renderer.dispose();
        renderer = null;
    }
    // Réinitialiser les variables globales
    scene = null;
    camera = null;
    icosahedronMesh = null; // S'assurer que le mesh est réinitialisé
    console.log("INIT ICOSA: 6. Variables Three.js globales réinitialisées.");


    // --- Recréation de la Scène, Caméra, Renderer ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);
    console.log("INIT ICOSA: 7. Nouveau canvas créé et ajouté au conteneur:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 
    console.log("INIT ICOSA: 8. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60, // FOV
        container.clientWidth / container.clientHeight,
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.z = 5; // Positionner la caméra pour l'icosaèdre
    camera.lookAt(0, 0, 0); 
    console.log("INIT ICOSA: 9. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT ICOSA: 10. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}.`);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT ICOSA: 11. Lumières ajoutées.");

    // --- Gestion du Redimensionnement ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE ICOSA WARN: Conteneur a des dimensions zéro lors du resize.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE ICOSA: Renderer.render appelé avec taille ${width}x${height}.`);
        } else {
            console.warn("RESIZE ICOSA WARN: Resize appelé mais Three.js non prêt (container, renderer, ou camera null).");
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);
    onWindowResize(); // Appel initial pour s'assurer que la taille est correcte
    console.log("INIT ICOSA: 12. Listeners de resize configurés et appel initial.");

    // --- Charger les données d'animation de l'icosaèdre depuis le back-end ---
    fetch("/icosahedron/initial")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("FETCH ICOSA SUCCESS: 13. Données reçues:", data); 
            frames = [{ vertices: data.vertices, faces: data.faces }];
            currentFrame = 0; 
            if (frames.length > 0) {
                updateIcosahedronGeometry(frames[0]); 
                // L'animation sera démarrée par .start()
            } else {
                console.warn("FETCH ICOSA WARN: 14. Aucune frame d'animation reçue pour l'icosaèdre.");
            }
        })
        .catch(error => {
            console.error('FETCH ICOSA ERROR: Erreur lors de la récupération des données d\'animation de l\'icosaèdre:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D de l\'icosaèdre.</p>';
            }
        });

    return {
        start: () => { 
            console.log("CONTROL ICOSA: 15. start() appelé. isAnimatingFlag:", isAnimatingFlag);
            if (!isAnimatingFlag) { 
                animateIcosahedron(); 
                isAnimatingFlag = true; // Met le drapeau à true
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            console.log("CONTROL ICOSA: 16. stop() appelé. isAnimatingFlag:", isAnimatingFlag);
            if (isAnimatingFlag) { 
                cancelAnimationFrame(animationId); 
                animationId = null; 
                isAnimatingFlag = false; // Met le drapeau à false
            } 
            // Vider les objets de la scène
            if (icosahedronMesh) {
                scene.remove(icosahedronMesh);
                icosahedronMesh.geometry.dispose();
                if (Array.isArray(icosahedronMesh.material)) {
                    icosahedronMesh.material.forEach(material => material.dispose());
                } else {
                    icosahedronMesh.material.dispose();
                }
                icosahedronMesh = null;
            }
        },
        resize: () => { console.log("CONTROL ICOSA: 17. resize() appelé."); onWindowResize(); },
        isRunning: () => isAnimatingFlag // Expose l'état de l'animation
    };
}

// Fonction pour créer ou mettre à jour la géométrie de l'icosaèdre
function updateIcosahedronGeometry(frame) {
    console.log("UPDATE ICOSA: 18. updateIcosahedronGeometry appelée.");
    // Nettoyage du mesh existant si on veut le recréer à chaque frame (pour l'icosaèdre, on met à jour)
    if (icosahedronMesh) {
        // Pour l'icosaèdre, on met à jour les attributs de position, pas on recrée le mesh entier.
        // Si le mesh existe déjà, on met à jour ses attributs plutôt que de le supprimer/recréer.
        icosahedronMesh.geometry.attributes.position.array = new Float32Array(frame.vertices.flat());
        icosahedronMesh.geometry.attributes.position.needsUpdate = true;
        // Si les faces changent, il faudrait aussi mettre à jour les indices:
        // icosahedronMesh.geometry.setIndex(new THREE.Uint16BufferAttribute(frame.faces.flat(), 1));
        icosahedronMesh.geometry.computeVertexNormals();
        return; // Sortir après la mise à jour
    }

    // Création initiale du mesh de l'icosaèdre
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(frame.vertices.flat(), 3));
    geometry.setIndex(new THREE.Uint16BufferAttribute(frame.faces.flat(), 1));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
        color: 0x00c0ff,
        flatShading: true,
        wireframe: false,
        shininess: 60
    });
    icosahedronMesh = new THREE.Mesh(geometry, material);

    const wireframe = new THREE.Mesh(
        geometry.clone(),
        new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.3, transparent: true })
    );
    icosahedronMesh.add(wireframe);
    scene.add(icosahedronMesh);
    console.log("UPDATE ICOSA: 19. Icosaèdre mesh créé et ajouté à la scène.");
}


// Boucle d'animation pour l'icosaèdre
function animateIcosahedron() { 
    animationId = requestAnimationFrame(animateIcosahedron);
    isAnimatingFlag = true; // S'assurer que le drapeau est à true pendant l'animation

    if (frames.length > 0) {
        if (currentFrame >= frames.length) { // Si on a atteint la fin, on revient au début
            currentFrame = 0;
        }
        updateIcosahedronGeometry(frames[currentFrame]);
        currentFrame++;
    }

    if (icosahedronMesh) {
        icosahedronMesh.rotation.x += 0.01;
        icosahedronMesh.rotation.y += 0.012;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}