// frontend/pyramids_visualizer.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

let scene = null; 
let camera = null;
let renderer = null;
let pyramidsGroup = null; 

let frames = [];
let currentFrame = 0;
let animationId = null; 

// Fonction d'initialisation de la scène Three.js pour les pyramides
export function initPyramidsVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur #${containerId} non trouvé pour le visualiseur de pyramides.`);
        return { start: () => {}, stop: () => {}, resize: () => {} };
    }

    // --- Nettoyage et Réinitialisation de la Scène Three.js existante ---
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
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


    // --- Recréation de la Scène, Caméra, Renderer pour la nouvelle visualisation ---
    const newCanvas = document.createElement('canvas'); 
    container.appendChild(newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); 

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    // Ajustement de la caméra: un peu plus loin sur Z, centré sur Y=0
    camera.position.set(0, 0, 40); // Plus loin sur Z, centré sur Y=0
    camera.lookAt(0, 0, 0); // Toujours regarder le centre

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    pyramidsGroup = new THREE.Group(); 
    scene.add(pyramidsGroup);

    // --- Gestion du Redimensionnement pour cette scène ---
    const onWindowResize = () => {
        if (container && renderer && camera) { 
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
        }
    };
    window.removeEventListener('resize', onWindowResize); 
    window.addEventListener('resize', onWindowResize);

    // --- Charger les données d'animation des pyramides depuis le back-end ---
    fetch('http://127.0.0.1:5000/pyramids/animate?steps=80&base_size=10&num_layers=5&brick_size=2') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Données reçues pour les pyramides:", data); 
            frames = data.frames;
            currentFrame = 0; 
            if (frames.length > 0) {
                updatePyramidsGeometry(frames[0]); 

                // --- RETIRER LE TEST CUBE ROUGE ICI ---
                // Le cube rouge n'est plus nécessaire car nous savons que le rendu fonctionne.
                // Si vous l'avez décommenté, veuillez le commenter à nouveau ou le supprimer.

            } else {
                console.warn("Aucune frame d'animation reçue pour les pyramides.");
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données d\'animation des pyramides:', error);
            if (container) {
                container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D des pyramides.</p>';
            }
        });

    return {
        start: () => { 
            if (!animationId) { 
                animatePyramids(); 
                if (container) onWindowResize(); 
            } 
        },
        stop: () => { 
            if (animationId) { 
                cancelAnimationFrame(animationId); 
                animationId = null; 
            } 
            if (pyramidsGroup) {
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
            }
        },
        resize: () => { onWindowResize(); } 
    };
}

// Fonction pour mettre à jour la géométrie des pyramides pour une frame donnée
function updatePyramidsGeometry(frame) {
    if (!pyramidsGroup) {
        console.error("pyramidsGroup non initialisé.");
        return;
    }

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

    if (!frame || !frame.pyramids || !Array.isArray(frame.pyramids)) {
        console.error("Format de frame invalide pour les pyramides:", frame);
        return;
    }

    const actualBrickSize = (frame.pyramids[0] && frame.pyramids[0].brick_size !== undefined) ? frame.pyramids[0].brick_size : 1.0;

    // CORRECTION 5: Appliquer un facteur d'échelle au groupe entier pour rendre les pyramides plus visibles
    // Cela les rendra plus grandes dans la scène.
    const globalScaleFactor = 4; // Facteur à ajuster selon la visibilité désirée
    pyramidsGroup.scale.set(globalScaleFactor, globalScaleFactor, globalScaleFactor);


    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("Données de pyramide ou de briques invalides dans la frame:", pyramidData);
            return;
        }
        
        pyramidData.bricks_positions.forEach(pos => {
            const brickGeometry = new THREE.BoxGeometry(actualBrickSize, actualBrickSize, actualBrickSize); 
            const brickMaterial = new THREE.MeshPhongMaterial({ color: 0x00c0ff }); 
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            // Les positions sont déjà dans l'échelle du système, pas besoin de les multiplier par globalScaleFactor ici
            brick.position.set(pos[0], pos[1], pos[2]); 
            pyramidsGroup.add(brick);
        });
    });

    // CORRECTION 6: Ajuster la position du groupe pour centrer les pyramides dans la vue
    // Les pyramides sont générées autour de y=0. Un décalage vers le bas pour mieux voir les deux.
    // Si la caméra est centrée sur Y=0, ce décalage n'est plus nécessaire.
    // Mais avec un scale factor, il faut peut-être décaler le groupe pour le centrer dans la vue de la caméra.
    // Si les pyramides sont centrées sur (0,0,0) dans le back-end, alors le groupe peut rester à (0,0,0)
    // et la caméra doit être positionnée en conséquence.
    pyramidsGroup.position.set(0, 0, 0); // Laisser le groupe à l'origine et ajuster la caméra si besoin
}

// Boucle d'animation pour les pyramides
function animatePyramids() { 
    animationId = requestAnimationFrame(animatePyramids);

    if (frames.length > 0) {
        if (currentFrame < frames.length) {
            updatePyramidsGeometry(frames[currentFrame]);
            currentFrame++;
        } else {
            currentFrame = 0; // Boucler l'animation
        }
    }

    // Rotation globale du groupe de pyramides
    if (pyramidsGroup) {
        pyramidsGroup.rotation.x += 0.005;
        pyramidsGroup.rotation.y += 0.007;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}
