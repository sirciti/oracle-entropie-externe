// frontend/pyramids_visualizer.js

import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

let scene, camera, renderer, pyramidsGroup; // Ces variables doivent être globales au module
let frames = [];
let currentFrame = 0;
let animationId; // Pour stocker l'ID de requestAnimationFrame et pouvoir l'annuler

// Fonction d'initialisation de la scène Three.js pour les pyramides
function initPyramidsVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Conteneur #${containerId} non trouvé pour le visualiseur de pyramides.`);
        return { start: () => {}, stop: () => {}, resize: () => {} }; // Retourne des fonctions vides
    }

    // --- Nettoyage et Réinitialisation de la Scène Three.js ---
    // Annule l'animation précédente si elle existe
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Nettoyer le conteneur HTML (retirer l'ancien canvas s'il y en a un)
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Nettoyer les objets de la scène précédente si elle existe
    if (scene) {
        scene.traverse(function(object) {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
        scene = null; // Réinitialiser la variable de scène
    }
    // Nettoyer le renderer aussi
    if (renderer) {
        renderer.dispose();
        renderer = null;
    }
    // Nettoyer la caméra
    if (camera) {
        camera = null;
    }


    // --- Recréation de la Scène, Caméra, Renderer ---
    const newCanvas = document.createElement('canvas'); // Créer un nouveau canvas pour la nouvelle scène
    container.appendChild(newCanvas);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818); // Fond sombre

    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 10, 30); // Ajuster la position de la caméra pour voir les pyramides entières
    camera.lookAt(0, 0, 0); // Regarder le centre

    renderer = new THREE.WebGLRenderer({ canvas: newCanvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight, false);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    pyramidsGroup = new THREE.Group(); // Groupe pour contenir toutes les briques des pyramides
    scene.add(pyramidsGroup);

    // Initialisation de l'écouteur de redimensionnement (pour la nouvelle instance de visualiseur)
    const onWindowResize = () => {
        if (container && renderer && camera) { // S'assurer que tous les objets sont initialisés
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (width === 0 || height === 0) return;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
            renderer.render(scene, camera); // Rendu après redimensionnement
        }
    };
    // S'assurer qu'un seul écouteur de redimensionnement est actif pour Three.js
    window.removeEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize);


    // --- Charger les données d'animation des pyramides depuis le back-end ---
    // Les paramètres base_size, num_layers, brick_size sont importants pour la taille des briques
    fetch('http://127.0.0.1:5000/pyramids/animate?steps=80&base_size=5&num_layers=3&brick_size=1') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Données reçues pour les pyramides:", data); // POUR DÉBOGAGE
            frames = data.frames;
            currentFrame = 0; // Réinitialiser la frame
            if (frames.length > 0) {
                updatePyramidsGeometry(frames[0]); // Initialiser avec la première frame
                // L'animation sera démarrée par .start() si l'utilisateur clique sur le bouton ou la navigation
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

    // Retourne un objet avec des méthodes de contrôle (start, stop, resize)
    return {
        start: () => { 
            if (!animationId) { 
                animatePyramids(); 
                // Assurez-vous que le conteneur est visible et que le canvas est à jour
                if (container) onWindowResize(); // Force un resize pour s'assurer que le canvas a la bonne taille
            } 
        },
        stop: () => { 
            if (animationId) { 
                cancelAnimationFrame(animationId); 
                animationId = null; 
            } 
            // Vider les objets de la scène Three.js quand on arrête et cache
            if (pyramidsGroup) {
                 while (pyramidsGroup.children.length > 0) {
                    const child = pyramidsGroup.children[0];
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                    pyramidsGroup.remove(child);
                }
            }
        },
        resize: () => { onWindowResize(); } // Expose la fonction de redimensionnement
    };
}

// Fonction pour mettre à jour la géométrie des pyramides pour une frame donnée
function updatePyramidsGeometry(frame) {
    if (!pyramidsGroup) {
        console.error("pyramidsGroup non initialisé.");
        return;
    }

    // Nettoyer le groupe avant d'ajouter les nouvelles briques
    while (pyramidsGroup.children.length > 0) {
        const child = pyramidsGroup.children[0];
        if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
        }
        pyramidsGroup.remove(child);
    }

    // Assurez-vous que la structure de la frame est correcte
    if (!frame || !frame.pyramids || !Array.isArray(frame.pyramids)) {
        console.error("Format de frame invalide pour les pyramides:", frame);
        return;
    }

    // Les briques sont de taille 1.0 par défaut, assurez-vous que cela correspond à votre backend
    // Si le backend génère des briques de taille différente, vous devrez passer cette taille.
    // Pour l'instant, on lit la taille de la première brique de la première pyramide, si disponible
    const defaultBrickSize = frame.pyramids[0] && frame.pyramids[0].bricks && frame.pyramids[0].bricks[0] && frame.pyramids[0].bricks[0].size !== undefined ? frame.pyramids[0].bricks[0].size : 1.0;


    frame.pyramids.forEach(pyramidData => {
        if (!pyramidData || !pyramidData.bricks_positions || !Array.isArray(pyramidData.bricks_positions)) {
            console.warn("Données de pyramide ou de briques invalides dans la frame:", pyramidData);
            return;
        }
        
        pyramidData.bricks_positions.forEach(pos => {
            const brickGeometry = new THREE.BoxGeometry(defaultBrickSize, defaultBrickSize, defaultBrickSize); 
            const brickMaterial = new THREE.MeshPhongMaterial({ color: 0x00c0ff }); // Couleur des briques
            const brick = new THREE.Mesh(brickGeometry, brickMaterial);
            brick.position.set(pos[0], pos[1], pos[2]);
            pyramidsGroup.add(brick);
        });
    });

    // Optionnel: ajuster la position du groupe pour centrer les pyramides
    // Si les pyramides ne sont pas centrées au fur et à mesure de l'animation
    pyramidsGroup.position.set(0, 0, 0); // Réinitialiser ou ajuster la position globale
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

    // Rotation globale du groupe de pyramides (pour que le système bouge)
    if (pyramidsGroup) {
        pyramidsGroup.rotation.x += 0.005;
        pyramidsGroup.rotation.y += 0.007;
    }

    if (renderer && scene && camera) { // S'assurer que tout est initialisé avant de rendre
        renderer.render(scene, camera);
    }
}

// Exporte la fonction d'initialisation pour qu'elle puisse être appelée par navigation.js
export { initPyramidsVisualizer };