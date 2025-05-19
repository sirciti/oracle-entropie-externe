import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

// Sélectionne le conteneur dédié à la 3D
const container = document.getElementById('icosahedron-3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

let icosahedronMesh = null;
let frames = [];
let currentFrame = 0;

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
        icosahedronMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        icosahedronMesh.geometry.setIndex(indices);
        icosahedronMesh.geometry.computeVertexNormals();
        icosahedronMesh.geometry.attributes.position.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (frames.length > 0 && currentFrame < frames.length) {
        updateIcosahedronGeometry(frames[currentFrame]);
        currentFrame++;
    }

    if (icosahedronMesh) {
        icosahedronMesh.rotation.x += 0.01;
        icosahedronMesh.rotation.y += 0.012;
    }

    renderer.render(scene, camera);
}

// Récupération des frames depuis l’API Flask
fetch('/icosahedron/animate?steps=80')
    .then(response => response.json())
    .then(data => {
        frames = data.frames;
        if (frames.length > 0) {
            updateIcosahedronGeometry(frames[0]);
            animate();
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des données d\'animation:', error);
    });

// Resize responsive basé sur le conteneur
window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
});
