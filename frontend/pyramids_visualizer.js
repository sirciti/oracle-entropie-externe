import { THREE } from "./three_utils.js";

let scene = null;
let camera = null;
let renderer = null;
let pyramidsGroup = null;
let frames = [];
let currentFrame = 0;
let animationId = null;

export function initPyramidsVisualizer(containerId) {
    console.log("INIT PYRA: 1. initPyramidsVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT PYRA ERROR: 2. Conteneur #${containerId} non trouvé.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }
    console.log("INIT PYRA: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // Nettoyage
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
    pyramidsGroup = null;
    frames = [];
    currentFrame = 0;
    console.log("INIT PYRA: 5. Variables Three.js globales réinitialisées.");

    // Recréation
    const newCanvas = document.createElement("canvas");
    container.appendChild(newCanvas);
    console.log("INIT PYRA: 6. Nouveau canvas créé et ajouté:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);
    console.log("INIT PYRA: 7. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 40);
    camera.lookAt(0, 0, 0);
    console.log("INIT PYRA: 8. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT PYRA: 9. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}`);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT PYRA: 10. Lumières ajoutées.");

    pyramidsGroup = new THREE.Group();
    scene.add(pyramidsGroup);
    console.log("INIT PYRA: 11. pyramidsGroup créé et ajouté à la scène.");

    let isRunning = false;

    // Gestion du redimensionnement
    const onWindowResize = () => {
        if (container && renderer && camera) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE PYRA WARN: Conteneur a des dimensions zéro.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            console.log(`RESIZE PYRA: Renderer.render appelé avec taille ${width}x${height}`);
        }
    };
    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    console.log("INIT PYRA: 12. Listener de resize configuré.");

    // Charger les données d'animation
    fetch("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2")
        .then(response => {
            if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("FETCH PYRA SUCCESS: 13. Données reçues:", data);
            frames = data.frames;
            if (frames.length > 0) {
                updatePyramidsGeometry(frames[0]);
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                    console.log("FETCH PYRA SUCCESS: 14. Rendu initial effectué.");
                }
            } else {
                console.warn("FETCH PYRA WARN: 15. Aucune frame reçue.");
            }
        })
        .catch(error => {
            console.error("FETCH PYRA ERROR:", error);
            container.innerHTML = "<p style='color: red; text-align: center;'>Erreur de chargement 3D.</p>";
        });

    // Animation
    function animatePyramids() {
        if (!isRunning) {
            console.log("ANIMATE PYRA: Arrêté par isRunning=false.");
            return;
        }
        animationId = requestAnimationFrame(animatePyramids);

        if (frames.length > 0) {
            if (currentFrame < frames.length) {
                updatePyramidsGeometry(frames[currentFrame]);
                currentFrame++;
            } else {
                currentFrame = 0;
            }
        }

        if (pyramidsGroup) {
            pyramidsGroup.rotation.x += 0.005;
            pyramidsGroup.rotation.y += 0.007;
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    return {
        start: () => {
            console.log("START PYRA: Animation démarrée.");
            isRunning = true;
            animatePyramids();
        },
        stop: () => {
            console.log("STOP PYRA: Animation arrêtée.");
            isRunning = false;
            cancelAnimationFrame(animationId);
            animationId = null;
        },
        resize: onWindowResize,
        isRunning: () => isRunning
    };
}

function updatePyramidsGeometry(frame) {
    console.log("UPDATE PYRA: 23. updatePyramidsGeometry appelée.");
    if (!pyramidsGroup) {
        console.error("UPDATE PYRA ERROR: 24. pyramidsGroup non initialisé.");
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
        console.error("UPDATE PYRA ERROR: 27. Format de frame invalide:", frame);
        return;
    }

    const actualBrickSize = (frame.pyramids[0] && frame.pyramids[0].brick_size !== undefined) ? frame.pyramids[0].brick_size : 1.0;
    console.log("UPDATE PYRA: 28. actualBrickSize:", actualBrickSize);

    const debugScaleFactor = 5;
    const pyramidColors = [0xff0000, 0x0000ff];

    let bricksAddedCount = 0;
    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("UPDATE PYRA WARN: 30. Données de pyramide invalides:", pyramidData);
            return;
        }

        const pyramidColor = pyramidColors[pyramidData.id % pyramidColors.length];
        pyramidData.bricks_positions.forEach(pos => {
            const brickGeometry = new THREE.BoxGeometry(actualBrickSize, actualBrickSize, actualBrickSize);
            const brickMaterial = new THREE.MeshPhongMaterial({ color: pyramidColor });
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            brick.position.set(pos[0] * debugScaleFactor, pos[1] * debugScaleFactor, pos[2] * debugScaleFactor);
            pyramidsGroup.add(brick);
            bricksAddedCount++;
        });
    });
    console.log("UPDATE PYRA: 31. Total briques ajoutées:", bricksAddedCount);

    pyramidsGroup.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(pyramidsGroup);
    console.log("UPDATE PYRA: 32. Bounding Box:", box);
}