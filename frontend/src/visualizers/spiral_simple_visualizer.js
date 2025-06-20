import * as THREE from "three";

let spiralGroup = null;
let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

export function initSpiralSimpleVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT SPIRAL_SIMPLE ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  // Initialisation Three.js
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x181818);

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 40; // Plus loin : 30 → 40

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  spiralGroup = new THREE.Group();
  scene.add(spiralGroup);

  // NOUVEAU : Variables pour le mouvement et rebonds
  let spiralPosition = new THREE.Vector3(0, 0, 0);
  let spiralVelocity = new THREE.Vector3(0.05, 0.03, 0.02);
  let spiralRotation = new THREE.Vector3(0, 0, 0);
  let spiralRotationSpeed = new THREE.Vector3(0.01, 0.015, 0.008);

  // Limites du conteneur (ajustées pour la caméra plus lointaine)
  const containerLimits = { x: 16, y: 12, z: 12 }; // Plus grandes limites

  // Variables luminescence
  let luminescenceIndex = 0;
  const luminescenceSpeed = 0.5;

  // Fetch des données
  fetch("/api/geometry/spiral_simple/animate")
    .then(res => res.json())
    .then(data => {
      console.log("Données spirale reçues:", data);
      updateSpiralGeometry(data);
      animateSpiral();
    })
    .catch(error => {
      console.error('FETCH SPIRAL_SIMPLE ERROR:', error);
      container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement de la spirale.</p>';
    });

  function updateSpiralGeometry(data) {
    if (!spiralGroup) return;

    // Nettoyer les objets existants
    while (spiralGroup.children.length > 0) {
      const child = spiralGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      spiralGroup.remove(child);
    }

    const points = data.frames[0].positions;
    console.log("Points à afficher:", points.length);

    points.forEach((point, index) => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Très gros et très détaillé
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(index / points.length, 1, 0.5),
        emissive: 0x000000,
        emissiveIntensity: 0
      });

      const sphere = new THREE.Mesh(geometry, material);

      // AGRANDISSEMENT : Multiplier par 4 au lieu de 2.5
      sphere.position.set(point[0] * 4, point[1] * 4, point[2] * 4);

      sphere.userData = {
        originalColor: new THREE.Color().setHSL(index / points.length, 1, 0.5),
        sphereIndex: index
      };

      spiralGroup.add(sphere);
    });
  }

  function updateSpiralMovement() {
    // ROTATION SUR ELLE-MÊME
    spiralRotation.add(spiralRotationSpeed);
    spiralGroup.rotation.set(spiralRotation.x, spiralRotation.y, spiralRotation.z);

    // DÉPLACEMENT AVEC INERTIE
    spiralPosition.add(spiralVelocity);
    spiralGroup.position.copy(spiralPosition);

    // REBONDS SUR LES BORDS
    if (Math.abs(spiralPosition.x) > containerLimits.x) {
      spiralVelocity.x *= -0.8; // Légère perte d'énergie au rebond
      spiralPosition.x = Math.sign(spiralPosition.x) * containerLimits.x;
    }
    if (Math.abs(spiralPosition.y) > containerLimits.y) {
      spiralVelocity.y *= -0.8;
      spiralPosition.y = Math.sign(spiralPosition.y) * containerLimits.y;
    }
    if (Math.abs(spiralPosition.z) > containerLimits.z) {
      spiralVelocity.z *= -0.8;
      spiralPosition.z = Math.sign(spiralPosition.z) * containerLimits.z;
    }
  }

  function updateSpiralLuminescence() {
    const spheres = spiralGroup.children;
    if (spheres.length === 0) return;

    // Réinitialiser toutes les sphères
    spheres.forEach(sphere => {
      sphere.material.emissive.setHex(0x000000);
      sphere.material.emissiveIntensity = 0;
    });

    // Calculer quelle sphère doit être lumineuse
    luminescenceIndex += luminescenceSpeed;
    const currentIndex = Math.floor(luminescenceIndex) % spheres.length;

    // Activer la luminescence sur la sphère courante
    const currentSphere = spheres[currentIndex];
    if (currentSphere) {
      currentSphere.material.emissive.setHex(0xffffff);
      currentSphere.material.emissiveIntensity = 1.0;

      // Effet de traînée
      for (let i = 1; i <= 3; i++) {
        const trailIndex = (currentIndex - i + spheres.length) % spheres.length;
        const trailSphere = spheres[trailIndex];
        if (trailSphere) {
          trailSphere.material.emissive.setHex(0x444444);
          trailSphere.material.emissiveIntensity = 0.3 / i;
        }
      }
    }
  }

  function animateSpiral() {
    if (!animationId) return;

    animationId = requestAnimationFrame(animateSpiral);

    if (spiralGroup) {
      // Mouvement et rebonds
      updateSpiralMovement();

      // Luminescence
      updateSpiralLuminescence();
    }

    renderer.render(scene, camera);
  }

  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animateSpiral();
      }
    },
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    isRunning: () => !!animationId,
    resize: () => {
      if (camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    }
  };
}
