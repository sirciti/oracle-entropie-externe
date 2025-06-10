import { THREE } from "./three_utils.js";

let scene = null;
let camera = null;
let renderer = null;
let shapesGroup = null;
let frames = [];
let currentFrame = 0;
let animationId = null;
let lastTime = 0;
const frameInterval = 1000 / 30; // 30 FPS
let frameProgress = 0;
const frameDuration = 100; // ms
let shapesData = [];
let torusMesh = null;
let knotMesh = null;
let miniShapes = [];
let isAnimatingFlag = false;

function createFractalShape({ type, position, size, color, velocity = null, fusionCount = 1 }) {
    let geometry, material, mesh;
    switch (type) {
        case "tetrahedron":
            geometry = new THREE.TetrahedronGeometry(size);
            break;
        case "sphere":
            geometry = new THREE.SphereGeometry(size, 16, 16);
            break;
        default:
            geometry = new THREE.TetrahedronGeometry(size);
    }
    material = new THREE.MeshPhongMaterial({ color, flatShading: true, transparent: true, opacity: 0.8 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.set(Math.cbrt(fusionCount), Math.cbrt(fusionCount), Math.cbrt(fusionCount));

    return {
        mesh,
        type,
        position: new THREE.Vector2(position.x, position.y),
        velocity: velocity || new THREE.Vector2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
        size: size * Math.cbrt(fusionCount),
        baseSize: size,
        color,
        fusionCount,
        boundingBox: new THREE.Box3().setFromObject(mesh)
    };
}

function updateBoundingBox(shape) {
    shape.boundingBox.setFromObject(shape.mesh);
}

function animateShapes(time) {
    if (!isAnimatingFlag) return;
    animationId = requestAnimationFrame(animateShapes);

    const delta = time - lastTime;
    if (delta < frameInterval) return;
    lastTime = time - (delta % frameInterval);

    // Interpolation des frames
    if (frames.length > 0) {
        frameProgress += delta;
        if (frameProgress >= frameDuration) {
            currentFrame = (currentFrame + 1) % frames.length;
            frameProgress -= frameDuration;
        }
        const t = frameProgress / frameDuration;
        const nextFrame = (currentFrame + 1) % frames.length;
        updateShapesGeometry(frames[currentFrame], frames[nextFrame], t);
    }

    // Physique
    shapesData.forEach(shape => {
        shape.position.x += shape.velocity.x * (delta / 1000);
        shape.position.y += shape.velocity.y * (delta / 1000);

        // Rebonds (±20)
        ["x", "y"].forEach(axis => {
            if (shape.position[axis] > 20 || shape.position[axis] < -20) {
                shape.velocity[axis] *= -0.9;
                shape.position[axis] = Math.max(-20, Math.min(20, shape.position[axis]));
            }
        });

        shape.mesh.rotation.x += 0.01 * (delta / frameInterval);
        shape.mesh.rotation.y += 0.012 * (delta / frameInterval);
        shape.mesh.position.set(shape.position.x, shape.position.y, shape.mesh.position.z);
        updateBoundingBox(shape);
    });

    // Collisions, fusion, division
    handleCollisions();

    // Animation toroïdale
    if (shapesGroup) {
        shapesGroup.rotation.y += 0.003 * (delta / frameInterval);
        shapesGroup.rotation.x += 0.002 * (delta / frameInterval);
    }
    if (knotMesh) knotMesh.rotation.z += 0.012 * (delta / frameInterval);
    miniShapes.forEach(shape => {
        shape.rotation.x += 0.008 * (delta / frameInterval);
        shape.rotation.y += 0.006 * (delta / frameInterval);
    });

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function handleCollisions() {
    for (let i = 0; i < shapesData.length; i++) {
        for (let j = i + 1; j < shapesData.length; j++) {
            const a = shapesData[i];
            const b = shapesData[j];
            if (a.boundingBox.intersectsBox(b.boundingBox)) {
                const dx = a.position.x - b.position.x;
                const dy = a.position.y - b.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                const minDist = (a.size + b.size) / 2;

                // Fusion si même couleur
                if (a.color === b.color) {
                    a.fusionCount += b.fusionCount;
                    const scale = Math.cbrt(a.fusionCount);
                    a.mesh.scale.set(scale, scale, scale);
                    a.size = a.baseSize * scale;
                    shapesGroup.remove(b.mesh);
                    shapesData.splice(j, 1);
                    j--;
                    updateBoundingBox(a);
                    continue;
                }

                // Division si couleurs différentes et fusionné
                if ((a.fusionCount > 1 || b.fusionCount > 1) && a.color !== b.color) {
                    const toDivide = a.fusionCount > 1 ? a : b;
                    const idxToRemove = a.fusionCount > 1 ? i : j;
                    const numNew = Math.min(3, toDivide.fusionCount, Math.floor(Math.random() * 3) + 1);
                    for (let k = 0; k < numNew; k++) {
                        const newShape = createFractalShape({
                            type: toDivide.type,
                            position: new THREE.Vector3(
                                toDivide.position.x + (Math.random() - 0.5) * 2,
                                toDivide.position.y + (Math.random() - 0.5) * 2,
                                toDivide.mesh.position.z
                            ),
                            size: toDivide.baseSize,
                            color: toDivide.color
                        });
                        shapesGroup.add(newShape.mesh);
                        shapesData.push(newShape);
                    }
                    shapesGroup.remove(toDivide.mesh);
                    shapesData.splice(idxToRemove, 1);
                    i = -1;
                    break;
                }

                // Collision élastique
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                a.position.x += (nx * overlap) / 2;
                a.position.y += (ny * overlap) / 2;
                b.position.x -= (nx * overlap) / 2;
                b.position.y -= (ny * overlap) / 2;
                a.mesh.position.set(a.position.x, a.position.y, a.mesh.position.z);
                b.mesh.position.set(b.position.x, b.position.y, b.mesh.position.z);

                const dvx = a.velocity.x - b.velocity.x;
                const dvy = a.velocity.y - b.velocity.y;
                const impact = dvx * nx + dvy * ny;
                if (impact < 0) {
                    a.velocity.x -= impact * nx;
                    a.velocity.y -= impact * ny;
                    b.velocity.x += impact * nx;
                    b.velocity.y += impact * ny;
                }
                updateBoundingBox(a);
                updateBoundingBox(b);
            }
        }
    }
}

function stopAnimation() {
    if (isAnimatingFlag) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false;
    }
}

function initializeShapes(frame) {
    shapesData = [];
    miniShapes = [];
    if (torusMesh) shapesGroup.remove(torusMesh);
    if (knotMesh) shapesGroup.remove(knotMesh);
    miniShapes.forEach(shape => shapesGroup.remove(shape));
    const debugScaleFactor = 5;

    // Tore principal
    torusMesh = new THREE.Mesh(
        new THREE.TorusGeometry(15, 3, 64, 256),
        new THREE.MeshPhongMaterial({ color: 0x1e90ff, shininess: 60, flatShading: true, transparent: true, opacity: 0.6 })
    );
    shapesGroup.add(torusMesh);

    // Spirale fractale (TorusKnot)
    knotMesh = new THREE.Mesh(
        new THREE.TorusKnotGeometry(13, 1.2, 400, 32, 7, 4),
        new THREE.MeshPhongMaterial({ color: 0xff0055, shininess: 100, flatShading: true, transparent: true, opacity: 0.9 })
    );
    shapesGroup.add(knotMesh);

    // Mini-shapes fractales
    for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2;
        const r = 15 + 3 * Math.cos(angle * 7);
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = 3 * Math.sin(angle * 3);
        const miniTorus = new THREE.Mesh(
            new THREE.TorusGeometry(1.2, 0.25, 8, 32),
            new THREE.MeshPhongMaterial({ color: 0xffc300 + i * 0x2000, flatShading: true, transparent: true, opacity: 0.8 })
        );
        miniTorus.position.set(x, y, z);
        shapesGroup.add(miniTorus);
        miniShapes.push(miniTorus);
        const miniSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.7 + Math.random() * 0.7, 8, 8),
            new THREE.MeshPhongMaterial({ color: 0x00fff0 + i * 0x1000, flatShading: true })
        );
        miniSphere.position.set(x + Math.cos(angle) * 2, y + Math.sin(angle) * 2, z + Math.sin(angle * 2) * 2);
        shapesGroup.add(miniSphere);
        miniShapes.push(miniSphere);
    }

    // Shapes dynamiques
    if (!frame || !frame.pyramids || !Array.isArray(frame.pyramids)) {
        for (let i = 0; i < 15; i++) {
            const shape = createFractalShape({
                type: ["tetrahedron", "sphere"][i % 2],
                position: new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, 0),
                size: 2 + Math.random() * 2,
                color: i % 2 === 0 ? 0xff0000 : 0x0000ff
            });
            shapesGroup.add(shape.mesh);
            shapesData.push(shape);
        }
        return;
    }

    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) return;
        const brickSize = pyramidData.brick_size || 1.0;
        pyramidData.bricks_positions.forEach(pos => {
            const shape = createFractalShape({
                type: pyramidData.id % 2 === 0 ? "tetrahedron" : "sphere",
                position: new THREE.Vector3(pos[0] * debugScaleFactor, pos[1] * debugScaleFactor, pos[2] * debugScaleFactor),
                size: brickSize,
                color: pyramidData.id % 2 === 0 ? 0xff0000 : 0x0000ff
            });
            shapesGroup.add(shape.mesh);
            shapesData.push(shape);
        });
    });
}

function updateShapesGeometry(currentFrame, nextFrame, t) {
    if (!shapesData.length || !currentFrame || !nextFrame || !currentFrame.pyramids || !nextFrame.pyramids) return;

    const debugScaleFactor = 5;
    let shapeIndex = 0;

    currentFrame.pyramids.forEach((pyramidData, i) => {
        const nextPyramid = nextFrame.pyramids[i] || pyramidData;
        if (!pyramidData.bricks_positions || !nextPyramid.bricks_positions) return;
        pyramidData.bricks_positions.forEach((pos, j) => {
            if (shapeIndex >= shapesData.length) return;
            const nextPos = nextPyramid.bricks_positions[j] || pos;
            const interpZ = pos[2] + (nextPos[2] - pos[2]) * t;
            const shape = shapesData[shapeIndex];
            shape.mesh.position.z = interpZ * debugScaleFactor;
            shape.mesh.material = new THREE.MeshPhongMaterial({
                color: pyramidData.id % 2 === 0 ? 0xff0000 : 0x0000ff,
                flatShading: true,
                transparent: true,
                opacity: 0.8
            });
            shape.color = pyramidData.id % 2 === 0 ? 0xff0000 : 0x0000ff;
            shape.mesh.visible = true;
            shapeIndex++;
        });
    });

    while (shapeIndex < shapesData.length) {
        shapesData[shapeIndex].mesh.visible = false;
        shapeIndex++;
    }
}

export function initPyramidsVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`INIT PYRA ERROR: Conteneur #${containerId} non trouvé.`);
        return { start: () => {}, stop: () => {}, resize: () => {}, isRunning: () => false };
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        isAnimatingFlag = false;
    }
    while (container.firstChild) container.removeChild(container.firstChild);

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
        while (scene.children.length > 0) scene.remove(scene.children[0]);
    }
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    scene = null;
    camera = null;
    shapesGroup = null;
    shapesData = [];
    torusMesh = null;
    knotMesh = null;
    miniShapes = [];
    isAnimatingFlag = false;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 60);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    shapesGroup = new THREE.Group();
    scene.add(shapesGroup);

    // Charger les données
    fetch("http://127.0.0.1:5000/geometry/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2")
        .then(response => {
            if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            return response.json();
        })
        .then(data => {
            frames = data.frames;
            if (frames.length > 0) {
                initializeShapes(frames[0]);
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                }
            } else {
                initializeShapes(null);
                if (renderer && scene && camera) {
                    renderer.render(scene, camera);
                }
            }
        })
        .catch(error => {
            console.error("FETCH PYRA ERROR:", error);
            container.innerHTML = "<p style='color: red; text-align: center;'>Erreur de chargement 3D.</p>";
            initializeShapes(null);
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        });

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
            renderer.setSize(width, height);
            renderer.render(scene, camera);
        }
    };

    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    return {
        start: () => {
            if (!isAnimatingFlag) {
                isAnimatingFlag = true;
                lastTime = performance.now();
                animateShapes(lastTime);
            }
        },
        stop: () => {
            stopAnimation();
        },
        resize: onWindowResize,
        isRunning: () => isAnimatingFlag
    };
}