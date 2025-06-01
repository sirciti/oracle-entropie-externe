import { THREE } from "./three_utils.js";

let scene = null;
let camera = null;
let renderer = null;
let cubesGroup = null;
let animationFrameId = null;
let currentStep = 0;
let frames = [];
let isAnimatingFlag = false;

function animateCubes() {
    if (!isAnimatingFlag) return;
    animationFrameId = requestAnimationFrame(animateCubes);

    if (frames.length === 0 || currentStep >= frames.length) {
        currentStep = 0;
        fetch("http://127.0.0.1:5000/geometry/cubes/animate?steps=150&dt=0.03&chaos=0.7")
            .then(response => {
                if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                return response.json();
            })
            .then(data => {
                frames = data.frames;
                if (frames.length > 0) {
                    updateCubesGeometry(frames[currentStep]); // Ligne ~26
                    currentStep++;
                }
            })
            .catch(error => console.error("FETCH CUBES ERROR:", error));
    } else {
        updateCubesGeometry(frames[currentStep]); // Ligne ~32
        currentStep++;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
    currentStep = 0;
    isAnimatingFlag = false;
}

function updateCubesGeometry(frame) {
    console.log("UPDATE CUBES: 23. updateCubesGeometry appelée.");
    if (!cubesGroup) {
        console.error("UPDATE CUBES ERROR: 24. cubesGroup non initialisé.");
        return;
    }
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
    if (!frame || !frame.cubes || !Array.isArray(frame.cubes)) {
        console.error("UPDATE CUBES ERROR: 27. Format de frame invalide:", frame);
        return;
    }
    let cubesAddedCount = 0;
    frame.cubes.forEach(cubeData => {
        if (!cubeData || cubeData.position === undefined || cubeData.size === undefined ||
            cubeData.rotation === undefined || cubeData.balls_positions === undefined) {
            console.warn("UPDATE CUBES WARN: 28. Données de cube invalides:", cubeData);
            return;
        }
        const cubeSize = cubeData.size;
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubeMesh.position.set(cubeData.position[0], cubeData.position[1], cubeData.position[2]);
        cubeMesh.rotation.set(
            THREE.MathUtils.degToRad(cubeData.rotation[0]),
            THREE.MathUtils.degToRad(cubeData.rotation[1]),
            THREE.MathUtils.degToRad(cubeData.rotation[2])
        );
        cubesGroup.add(cubeMesh);
        cubesAddedCount++;
        const ballRadius = cubeData.ball_radius || (cubeSize / 8.0);
        const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        if (cubeData.balls_positions && Array.isArray(cubeData.balls_positions)) {
            cubeData.balls_positions.forEach(ballPos => {
                const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
                const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
                ballMesh.position.set(ballPos[0], ballPos[1], ballPos[2]);
                cubeMesh.add(ballMesh);
            });
        }
    });
    console.log("UPDATE CUBES: 29. Total cubes ajoutés:", cubesAddedCount);
    cubesGroup.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(cubesGroup);
    console.log("UPDATE CUBES: Bounding Box:", box);
}

export function initCubesVisualizer(containerId) {
    console.log("INIT CUBES: 1. initCubesVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT CUBES ERROR: 2. Conteneur #${containerId} non trouvé.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: false };
    }
    console.log("INIT CUBES: 2.1 Conteneur trouvé. ClientWidth:", container.clientWidth, "clientHeight:", container.clientHeight);

    // Nettoyage
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        isAnimatingFlag = false;
        console.log("INIT CUBES: 3. Animation précédente annulée.");
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    console.log("INIT CUBES: 4. Conteneur HTML nettoyé.");

    if (scene) {
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
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    scene = null;
    camera = null;
    cubesGroup = null;
    console.log("INIT CUBES: 7. Variables Three.js globales réinitialisées.");

    // Recréation
    const newCanvas = document.createElement("canvas");
    container.appendChild(newCanvas);
    console.log("INIT CUBES: 8. Nouveau canvas créé et ajouté:", newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);
    console.log("INIT CUBES: 9. Scène créée avec fond.");

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 40);
    camera.lookAt(0, 0, 0);
    console.log("INIT CUBES: 10. Caméra créée et positionnée:", camera.position);

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    console.log(`INIT CUBES: 11. Renderer créé et dimensionné ${renderer.domElement.width}x${renderer.domElement.height}`);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    console.log("INIT CUBES: 12. Lumières ajoutées.");

    cubesGroup = new THREE.Group();
    scene.add(cubesGroup);
    console.log("INIT CUBES: 13. cubesGroup créé et ajouté à la scène.");

    const onWindowResize = () => {
        if (container && renderer && camera) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("RESIZE CUBES WARN: Conteneur a des dimensions zéro.");
                return;
            }
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
                        renderer.setSize(width, height, false);
                        renderer.render(scene, camera);
                        console.log(`RESIZE CUBES: Renderer.render appelé avec taille ${width}x${height}`);
                    }
                };
            
                // Optionally, add the resize event listener here
                window.addEventListener("resize", onWindowResize);
            
                // Return control functions
                return {
                    start: () => {
                        isAnimatingFlag = true;
                        animateCubes();
                    },
                    stop: stopAnimation,
                    resize: onWindowResize,
                    isRunning: () => isAnimatingFlag
                };
            }