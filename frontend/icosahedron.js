// frontend/icosahedron.js

import { THREE } from "./three_utils.js"; 

let scene = null; 
let camera = null;
let renderer = null;
let icosahedronMesh = null;
let frames = [];
let currentFrame = 0;
let animationId = null;

// Fonction d'initialisation de la scène Three.js pour l'icosaèdre
// Elle est exportée pour être appelée par navigation.js
export function initIcosahedronVisualizer(containerId) {
    console.log("INIT ICOSA: 1. initIcosahedronVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT ICOSA ERROR: 2. Conteneur #${containerId} non trouvé.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    console.log("INIT ICOSA: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // Nettoyage
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        console.log("INIT ICOSA: 3. Animation précédente annulée.");
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    console.log("INIT ICOSA: 4. Conteneur HTML nettoyé.");

    if (scene) {
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
        renderer.dispose();
        renderer = null;
    }
    scene = null;
    camera = null;
    icosahedronMesh = null;
    frames = [];
    currentFrame = 0;
    console.log("INIT ICOSA: 5. Variables Three.js globales réinitialisées.");

    // Recréation
    const newCanvas = document.createElement("canvas");
    container.appendChild(newCanvas);
    console.log("INIT ICOSA: 6. Nouveau canvas créé et ajouté:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);
    console.log("INIT ICOSA: 7. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight || 1, // Éviter division par zéro
        0.1,
        1000
    );
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);
    console.log("INIT ICOSA: 8. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false); // Éviter dimensions nulles
    console.log(`INIT ICOSA: 9. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}`);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT ICOSA: 10. Lumières ajoutées.");

    let isRunning = false;

    // Gestion du redimensionnement
    const onWindowResize = () => {
        if (!container || !renderer || !camera) return;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        if (width === 0 || height === 0) {
            console.warn("RESIZE ICOSA WARN: Conteneur a des dimensions zéro.");
            return;
        }
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
        console.log(`RESIZE ICOSA: Renderer.render appelé avec taille ${width}x${height}`);
    };

    // Débouncer pour limiter les appels de redimensionnement
    let resizeTimeout;
    const debouncedResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onWindowResize, 100);
    };
    window.addEventListener("resize", debouncedResize);

    // Attendre que le conteneur soit visible avant le premier redimensionnement
    const checkContainerReady = () => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            onWindowResize();
        } else {
            setTimeout(checkContainerReady, 50);
        }
    };
    setTimeout(checkContainerReady, 0);
    console.log("INIT ICOSA: 11. Listener de resize configuré avec debounce.");

    // Charger les données d'animation
    fetch("http://127.0.0.1:5000/geometry/icosahedron/animate?steps=80")
        .then(response => {
            if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("FETCH ICOSA SUCCESS: 12. Données reçues:", data);
            frames = data.frames;
            if (frames.length > 0) {
                updateIcosahedronGeometry(frames[0]);
            } else {
                console.warn("FETCH ICOSA WARN: 13. Aucune frame reçue.");
            }
        })
        .catch(error => {
            console.error("FETCH ICOSA ERROR:", error);
            container.innerHTML = "<p style='color: red; text-align: center;'>Erreur de chargement 3D.</p>";
        });

    // Animation
    function animateIcosahedron() {
        if (!isRunning) return;
        animationId = requestAnimationFrame(animateIcosahedron);

        if (frames.length > 0) {
            if (currentFrame < frames.length) {
                updateIcosahedronGeometry(frames[currentFrame]);
                currentFrame++;
            } else {
                currentFrame = 0;
            }
        }

        if (icosahedronMesh) {
            icosahedronMesh.rotation.x += 0.01;
            icosahedronMesh.rotation.y += 0.012;
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    return {
        start: () => {
            console.log("START ICOSA: Animation démarrée.");
            isRunning = true;
            animateIcosahedron();
        },
        stop: () => {
            console.log("STOP ICOSA: Animation arrêtée.");
            isRunning = false;
            cancelAnimationFrame(animationId);
            animationId = null;
        },
        resize: onWindowResize,
        isRunning: () => isRunning
    };
}

// Fonction pour créer ou mettre à jour la géométrie de l'icosaèdre
function updateIcosahedronGeometry(frame) {
    console.log("UPDATE ICOSA: 18. updateIcosahedronGeometry appelée.");
    if (icosahedronMesh) {
        icosahedronMesh.geometry.attributes.position.array = new Float32Array(frame.vertices.flat());
        icosahedronMesh.geometry.attributes.position.needsUpdate = true;
        icosahedronMesh.geometry.computeVertexNormals();
        return;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(frame.vertices.flat(), 3));
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
