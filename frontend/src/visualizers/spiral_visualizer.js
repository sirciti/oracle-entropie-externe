import * as THREE from 'three';

export function initSpiralVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur #${containerId} non trouvé pour le visualiseur spirale.`);
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  let spiral = null;
  let running = true;

  async function loadSpiral() {
    try {
      const response = await fetch('http://backend:8000/geometry/spiral/initial');
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const { positions } = await response.json();
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(positions.flatMap(p => [p.x, p.y, p.z]));
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      spiral = new THREE.Line(geometry, material);
      scene.add(spiral);
    } catch (error) {
      console.error('Erreur lors du chargement des données de la spirale:', error);
    }
  }

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    if (spiral) spiral.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  camera.position.z = 5;
  loadSpiral();
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  return {
    start() {
      if (!running) {
        running = true;
        animate();
      }
    },
    stop() {
      running = false;
    },
    isRunning() {
      return running;
    }
  };
}