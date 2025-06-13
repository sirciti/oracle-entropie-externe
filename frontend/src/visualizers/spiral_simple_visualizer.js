import * as THREE from 'three';

let spiralGroup = null;
let scene = null;
let animationId = null;

export function initSpiralSimpleVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT SPIRAL_SIMPLE ERROR: Conteneur #${containerId} non trouvé pour le visualiseur de spirale simple.`);
    return null;
  }

  scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  spiralGroup = new THREE.Group();
  scene.add(spiralGroup);

  camera.position.z = 5;

  fetch('http://localhost:5000/geometry/spiral_simple/animate?...')
    .then(res => res.json())
    .then(data => {
      updateSpiralGeometry(data);
      animateSpiral();
    })
    .catch(error => {
      console.error('FETCH SPIRAL_SIMPLE ERROR: Erreur lors de la récupération des données de spirale simple:', error);
      container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement 3D de la spirale simple.</p>';
    });

  function updateSpiralGeometry(frame) {
    if (!spiralGroup) return;
    while (spiralGroup.children.length > 0) {
      spiralGroup.remove(spiralGroup.children[0]);
    }

    if (!frame || !frame.spiral_positions) {
      console.error('UPDATE SPIRAL_SIMPLE ERROR: Format de frame invalide:', frame);
      return;
    }

    frame.spiral_positions.forEach(pos => {
      const geometry = new THREE.SphereGeometry(0.1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(pos[0], pos[1], pos[2]);
      spiralGroup.add(sphere);
    });
  }

  function animateSpiral() {
    animationId = requestAnimationFrame(animateSpiral);
    if (spiralGroup) {
      spiralGroup.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  }

  return {
    start: () => !animationId && animateSpiral(),
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    isRunning: () => !!animationId
  };
}
