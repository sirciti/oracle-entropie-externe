import { THREE } from "./three_utils.js";

let scene = null;
let camera = null;
let renderer = null;
let cubesGroup = null;
let animationFrameId = null;
let isAnimatingFlag = false;

// Structure pour stocker les données dynamiques des cubes
let cubesData = [];

function animateCubes() {
    if (!isAnimatingFlag) {
        console.log("ANIMATE CUBES: Arrêté par isAnimatingFlag=false.");
        return;
    }
    animationFrameId = requestAnimationFrame(animateCubes);

    // Mettre à jour les positions et rotations des cubes
    cubesData.forEach(cube => {
        // Déplacer avec vitesse
        cube.position.add(cube.velocity);
        // Rebondir sur les limites (±20)
        ['x', 'y', 'z'].forEach(axis => {
            if (cube.position[axis] > 20 || cube.position[axis] < -20) {
                cube.velocity[axis] *= -1;
                cube.position[axis] = Math.max(-20, Math.min(20, cube.position[axis]));
            }
        });
        // Rotation aléatoire
        cube.rotation.x += (Math.random() - 0.5) * 0.03;
        cube.rotation.y += (Math.random() - 0.5) * 0.03;
        cube.rotation.z += (Math.random() - 0.5) * 0.03;
        // Mettre à jour les billes
        cube.balls.forEach(ball => {
            // Déplacer avec vitesse
            ball.position.add(ball.velocity);
            // Rebondir dans le cube (±size * 0.25)
            ['x', 'y', 'z'].forEach(axis => {
                if (Math.abs(ball.position[axis]) > cube.size * 0.25) {
                    ball.velocity[axis] *= -1;
                    ball.position[axis] = Math.max(-cube.size * 0.25, Math.min(cube.size * 0.25, ball.position[axis]));
                }
            });
            ball.mesh.position.copy(ball.position);
        });
        // Appliquer les transformations au mesh
        cube.mesh.position.copy(cube.position);
        cube.mesh.rotation.copy(cube.rotation);
    });

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    isAnimatingFlag = false;
}

function updateCubesGeometry() {
    console.log("UPDATE CUBES: 23. updateCubesGeometry appelée.");
    if (!cubesGroup) {
        console.error("UPDATE CUBES ERROR: 24. cubesGroup non initialisé.");
        return;
    }
    // Nettoyer les anciens meshes
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
    // Initialiser les cubes dynamiques (10 cubes)
    cubesData = [];
    for (let i = 0; i < 10; i++) {
        const cubeSize = 2 + Math.random() * 3; // Taille entre 2 et 5
        const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const cube = {
            mesh: cubeMesh,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            ),
            rotation: new THREE.Euler(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ),
            size: cubeSize,
            balls: []
        };
        // Ajouter 3 à 5 billes par cube
        const numBalls = 3 + Math.floor(Math.random() * 3);
        const ballRadius = cubeSize / 8;
        const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        for (let j = 0; j < numBalls; j++) {
            const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
            const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
            const ball = {
                mesh: ballMesh,
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * cubeSize * 0.5,
                    (Math.random() - 0.5) * cubeSize * 0.5,
                    (Math.random() - 0.5) * cubeSize * 0.5
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                )
            };
            ballMesh.position.copy(ball.position);
            cubeMesh.add(ballMesh);
            cube.balls.push(ball);
        }
        cubeMesh.position.copy(cube.position);
        cubeMesh.rotation.copy(cube.rotation);
        cubesGroup.add(cubeMesh);
        cubesData.push(cube);
    }
    console.log("UPDATE CUBES: 29. Total cubes ajoutés:", cubesData.length);
    cubesGroup.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(cubesGroup);
    console.log("UPDATE CUBES: Bounding Box:", box);
}

export function initCubesVisualizer(containerId) {
    console.log("INIT CUBES: 1. initCubesVisualizer appelé avec containerId:", containerId);
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT CUBES ERROR: 2. Conteneur #${containerId} non trouvé.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
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
    cubesData = [];
    console.log("INIT CUBES: 7. Variables globales réinitialisées.");

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

    // Initialiser les cubes
    updateCubesGeometry();

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

    window.addEventListener("resize", onWindowResize);
    onWindowResize();
    console.log("INIT CUBES: 14. Listener de resize configuré.");

    return {
        start: () => {
            console.log("START CUBES: Animation démarrée.");
            isAnimatingFlag = true;
            animateCubes();
        },
        stop: () => {
            console.log("STOP CUBES: Animation arrêtée.");
            stopAnimation();
        },
        resize: onWindowResize,
        isRunning: () => isAnimatingFlag
    };
}