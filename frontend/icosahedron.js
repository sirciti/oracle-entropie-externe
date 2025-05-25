// frontend/icosahedron.js

import { THREE } from './three_utils.js'; 

const container = document.getElementById('icosahedron-3d');
const canvas = document.createElement('canvas'); // Create canvas dynamically

let renderer, camera, scene, icosahedronMesh, frames = [], currentFrame = 0;
let animationId; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler

// Fonction d'initialisation de la scène Three.js pour l'icosaèdre
function initIcosahedronVisualizer(containerId) {
    const localContainer = document.getElementById(containerId); // Utiliser une variable locale pour le conteneur
    if (!localContainer) {
        console.error(`Conteneur #${containerId} non trouvé pour le visualiseur d'icosaèdre.`);
        return { start: () => {}, stop: () => {}, resize: () => {} };
    }

    // Annule l'animation précédente si elle existe
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Nettoyer le conteneur et la scène pour une réinitialisation propre
    while (localContainer.firstChild) {
        localContainer.removeChild(localContainer.firstChild);
    }
    // Nettoyer la scène des objets précédents si elle existe
    if (scene) {
        while (scene.children.length > 0) {
            const child = scene.children[0];
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
            scene.remove(child);
        }
        scene = null; // Réinitialiser la scène
    }
    
    // Recréer le canvas et l'ajouter au conteneur
    const newCanvas = document.createElement('canvas');
    localContainer.appendChild(newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);

    camera = new THREE.PerspectiveCamera(
        60,
        localContainer.clientWidth / localContainer.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(localContainer.clientWidth, localContainer.clientHeight, false);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Charger les données d'animation de l'icosaèdre
    fetch('http://127.0.0.1:5000/icosahedron/animate?steps=80')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            frames = data.frames;
            currentFrame = 0; // Réinitialiser la frame
            if (frames.length > 0) {
                updateIcosahedronGeometry(frames[0]); // Initialiser avec la première frame
            } else {
                console.warn("Aucune frame d'animation reçue pour l'icosaèdre.");
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données d\'animation de l\'icosaèdre:', error);
            if (localContainer) {
                localContainer.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D de l\'icosaèdre.</p>';
            }
        });

    // Écouteur pour le redimensionnement de la fenêtre
    const onWindowResize = () => {
        if (localContainer && renderer && camera) {
            const width = localContainer.clientWidth;
            const height = localContainer.clientHeight;
            if (width === 0 || height === 0) return;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
        }
    };
    window.removeEventListener('resize', onWindowResize); // S'assurer qu'un seul écouteur est actif
    window.addEventListener('resize', onWindowResize);

    return {
        start: () => { if (!animationId) animateIcosahedron(); },
        stop: () => { if (animationId) cancelAnimationFrame(animationId); animationId = null; },
        resize: () => { onWindowResize(); }
    };
}

// Fonction pour créer ou mettre à jour la géométrie de l'icosaèdre
function updateIcosahedronGeometry(frame) {
    if (!icosahedronMesh && scene) { // S'assurer que le mesh est créé une seule fois
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(frame.vertices.flat(), 3));
        geometry.setIndex(frame.faces.flat());
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
    } else if (icosahedronMesh) {
        // Mettre à jour les attributs de position de la géométrie existante
        icosahedronMesh.geometry.attributes.position.array = new Float32Array(frame.vertices.flat());
        icosahedronMesh.geometry.attributes.position.needsUpdate = true;
        icosahedronMesh.geometry.setIndex(new THREE.Uint16BufferAttribute(frame.faces.flat(), 1)); // Mettre à jour les indices si les faces changent
        icosahedronMesh.geometry.computeVertexNormals();
    }
}


// Boucle d'animation pour l'icosaèdre
function animateIcosahedron() { // Renommé pour éviter le conflit avec animate() général
    animationId = requestAnimationFrame(animateIcosahedron);

    if (frames.length > 0) {
        if (currentFrame < frames.length) {
            updateIcosahedronGeometry(frames[currentFrame]);
            currentFrame++;
        } else {
            currentFrame = 0; // Boucler l'animation
        }
    }

    // Rotation automatique
    if (icosahedronMesh) {
        icosahedronMesh.rotation.x += 0.01;
        icosahedronMesh.rotation.y += 0.012;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Exporte la fonction d'initialisation pour qu'elle puisse être appelée par navigation.js
export { initIcosahedronVisualizer };