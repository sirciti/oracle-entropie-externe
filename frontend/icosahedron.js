import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

const container = document.getElementById('icosahedron-3d');
const canvas = document.createElement('canvas'); // Create canvas dynamically

let renderer, camera, scene, icosahedronMesh, frames = [], currentFrame = 0;

if (container) {
    container.appendChild(canvas); // Append it to the container

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);

    camera = new THREE.PerspectiveCamera(
        60,
        (container.clientWidth / container.clientHeight) || (window.innerWidth / window.innerHeight), // Fallback if container is 0 initially
        0.1,
        1000
    );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    // renderer.setSize will be set by resizeThreeCanvas

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Initial call to set size
    resizeThreeCanvas();
    window.addEventListener('resize', resizeThreeCanvas); // Listen for window resize

    // Fetch data and start animation
    fetch('http://127.0.0.1:5000/icosahedron/animate?steps=80')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            frames = data.frames;
            if (frames.length > 0) {
                updateIcosahedronGeometry(frames[0]); // Initialize with first frame
                animate(); // Start animation loop
            } else {
                console.warn("Aucune frame d'animation reçue.");
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données d\'animation:', error);
            if (container) { // Clear container if error
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D.</p>';
            }
        });

} else {
    console.error("Conteneur #icosahedron-3d non trouvé. La scène 3D ne peut pas être initialisée.");
}


// Function to resize renderer and camera
function resizeThreeCanvas() {
    // Only resize if renderer and camera are initialized
    if (container && renderer && camera) { 
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) { 
            // console.warn("Container has zero dimensions, skipping resize."); // Useful for debugging
            return; // Skip resize if dimensions are zero
        }

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera); // Re-render after resize to update view
    }
}

// Function to create or update icosahedron geometry
function updateIcosahedronGeometry(frame) {
    const vertices = frame.vertices.flat();
    const indices = frame.faces.flat();

    if (!icosahedronMesh) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
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
    } else {
        // Update existing geometry's attributes
        icosahedronMesh.geometry.attributes.position.array = new Float32Array(vertices); // Direct array update
        icosahedronMesh.geometry.attributes.position.needsUpdate = true; // Flag for update
        
        // If indices change, re-setIndex. For Loop subdivision, indices might grow.
        // For current setup, indices generally don't change after initial setup, only vertex positions.
        // If faces are re-calculated per frame, then setIndex should be updated too.
        // For now, assuming faces are static after initial load or grow only in subdivide.
        // If faces change in animate, uncomment/add: icosahedronMesh.geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
        
        icosahedronMesh.geometry.computeVertexNormals();
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (frames.length > 0) {
        // Play through frames, loop if needed
        if (currentFrame < frames.length) {
            updateIcosahedronGeometry(frames[currentFrame]);
            currentFrame++;
        } else {
            currentFrame = 0; // Loop back to start
        }
    }

    // Automatic rotation
    if (icosahedronMesh) {
        icosahedronMesh.rotation.x += 0.01;
        icosahedronMesh.rotation.y += 0.012;
    }

    renderer.render(scene, camera);
}