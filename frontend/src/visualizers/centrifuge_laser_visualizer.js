import * as THREE from "three";

let centrifugeGroup = null;
let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Objets de la centrifugeuse
let laserCenter = null;
let armTop = null;
let armBottom = null;
let sphereMeshes = [];
let cubeMeshes = [];

// Variables d'animation
let centrifugeRotation = 0;
let luminescenceIndex = 0;
const luminescenceSpeed = 0.4;

export function initCentrifugeLaserVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT CENTRIFUGE_LASER ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  // NETTOYAGE COMPLET RENFORCÉ
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Réinitialiser toutes les variables globales du module
  if (scene) {
    scene.clear();
    if (typeof scene.dispose === "function") scene.dispose();
    scene = null;
  }
  if (renderer) {
    renderer.dispose();
    if (typeof renderer.forceContextLoss === "function") renderer.forceContextLoss();
    renderer = null;
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  centrifugeGroup = null;
  laserCenter = null;
  armTop = null;
  armBottom = null;
  sphereMeshes = [];
  cubeMeshes = [];
  centrifugeRotation = 0;
  luminescenceIndex = 0;
  camera = null;

  // Initialisation Three.js
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505); // Fond très sombre pour effet laser
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(15, 10, 15);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Éclairage dramatique
  const ambientLight = new THREE.AmbientLight(0x202020, 0.3);
  scene.add(ambientLight);
  
  const spotLight = new THREE.SpotLight(0x00ffff, 2, 50, Math.PI / 4, 0.5);
  spotLight.position.set(0, 20, 0);
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
  scene.add(spotLight.target);

  centrifugeGroup = new THREE.Group();
  scene.add(centrifugeGroup);

  // Fetch des données
  fetch("/api/geometry/centrifuge_laser/animate")
    .then(res => res.json())
    .then(data => {
      console.log("Données centrifugeuse laser reçues:", data);
      createCentrifugeSystem(data.frames[0]);
      // SUPPRIMÉ : animateCentrifugeLaser(); 
    })
    .catch(error => {
      console.error('FETCH CENTRIFUGE_LASER ERROR:', error);
      container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement de la centrifugeuse laser.</p>';
    });

  function createCentrifugeSystem(frameData) {
    // 1. CENTRE LASER avec ARC ÉLECTRIQUE
    const centerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x004444,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.9
    });
    laserCenter = new THREE.Mesh(centerGeometry, centerMaterial);
    laserCenter.position.set(0, 0, 0);
    centrifugeGroup.add(laserCenter);

    // HALO VISIBLE CORRIGÉ
    const haloGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    laserCenter.add(halo);

    // ARC ÉLECTRIQUE SINUSOÏDAL
    const arcPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const radius = 0.8 + Math.sin(angle * 8) * 0.2;
      arcPoints.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.sin(angle * 4) * 0.1
      ));
    }
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    const arcElectric = new THREE.Line(arcGeometry, arcMaterial);
    laserCenter.add(arcElectric);

    // 2. TIGES CORRIGÉES avec géométrie futuriste
    const armGeometry = new THREE.CylinderGeometry(0.1, 0.05, 12, 12);
    const armMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      emissive: 0x004444,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    
    // TIGE VERTICALE (12h) - CORRIGÉE
    armTop = new THREE.Mesh(armGeometry, armMaterial);
    armTop.position.set(0, 6, 0);
    centrifugeGroup.add(armTop);

    // TIGE HORIZONTALE (6h) - CORRIGÉE  
    armBottom = new THREE.Mesh(armGeometry, armMaterial);
    armBottom.rotation.z = Math.PI / 2;
    armBottom.position.set(6, 0, 0);
    centrifugeGroup.add(armBottom);

    // 3. SPHÈRES ALIGNÉES SUR TIGE 12H
    sphereMeshes = [];
    const sphereCount = frameData.spheres.length;
    frameData.spheres.forEach((sphere, index) => {
      const sphereGeometry = new THREE.SphereGeometry(0.4, 20, 20);
      const sphereMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(sphere.color[0], sphere.color[1], sphere.color[2]),
        emissive: 0x000000,
        emissiveIntensity: 0,
        shininess: 100
      });
      
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      const angle = (index / sphereCount) * Math.PI * 2;
      const radius = 3;
      sphereMesh.position.set(
        Math.cos(angle) * radius,
        8 + Math.sin(angle * 2) * 2,
        Math.sin(angle) * radius
      );
      sphereMesh.userData = {
        originalColor: new THREE.Color(sphere.color[0], sphere.color[1], sphere.color[2]),
        sphereIndex: index,
        inertiaDelay: 0.8 + index * 0.1,
        initialAngle: angle,
        baseRadius: radius
      };
      centrifugeGroup.add(sphereMesh);
      sphereMeshes.push(sphereMesh);
    });

    // 4. CUBES ALIGNÉS SUR TIGE 6H
    cubeMeshes = [];
    const cubeCount = frameData.cubes.length;
    frameData.cubes.forEach((cube, index) => {
      const cubeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const cubeMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(cube.color[0], cube.color[1], cube.color[2]),
        emissive: 0x000000,
        emissiveIntensity: 0,
        shininess: 100
      });
      const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
      const angle = (index / cubeCount) * Math.PI * 2;
      const radius = 4;
      cubeMesh.position.set(
        8 + Math.cos(angle * 2) * 2,
        Math.sin(angle) * radius,
        Math.cos(angle) * radius
      );
      cubeMesh.userData = {
        originalColor: new THREE.Color(cube.color[0], cube.color[1], cube.color[2]),
        cubeIndex: index,
        inertiaDelay: 0.6 + index * 0.08,
        initialAngle: angle,
        baseRadius: radius
      };
      centrifugeGroup.add(cubeMesh);
      cubeMeshes.push(cubeMesh);
    });

    console.log(`CENTRIFUGEUSE CORRIGÉE: ${sphereMeshes.length} sphères alignées 12h, ${cubeMeshes.length} cubes alignés 6h`);
  }

  function updateCentrifugeAnimation() {
    const time = Date.now() * 0.001;
    centrifugeRotation += 0.02;
    
    // 1. ANIMATION DU LASER CENTRAL AMÉLIORÉE
    if (laserCenter) {
      const pulse = Math.sin(time * 5) * 0.5 + 0.5;
      laserCenter.material.emissiveIntensity = 0.8 + pulse * 1.2;
      laserCenter.rotation.y += 0.1;
      const hue = (time * 0.3) % 1;
      laserCenter.material.emissive.setHSL(hue, 1, 0.4);
      laserCenter.material.color.setHSL(hue, 1, 0.9);
      const halo = laserCenter.children[0];
      if (halo) {
        halo.material.opacity = 0.2 + pulse * 0.3;
        halo.material.color.setHSL(hue, 1, 0.8);
        halo.rotation.x += 0.02;
        halo.rotation.y -= 0.03;
      }
      const arc = laserCenter.children[1];
      if (arc) {
        arc.material.opacity = 0.6 + pulse * 0.4;
        arc.material.color.setHSL(hue, 1, 0.8);
        arc.rotation.z += 0.05;
      }
    }

    // 2. ROTATION DES TIGES CORRIGÉE
    if (armTop) {
      armTop.rotation.y = centrifugeRotation;
      armTop.material.emissive.setHSL((time * 0.3) % 1, 0.8, 0.2);
    }
    if (armBottom) {
      armBottom.rotation.y = centrifugeRotation * 0.7;
      armBottom.material.emissive.setHSL((time * 0.3 + 0.5) % 1, 0.8, 0.2);
    }

    // 3. SPHÈRES AUTOUR DE LA TIGE 12H (INERTIE)
    sphereMeshes.forEach((sphere, index) => {
      const userData = sphere.userData;
      const delayedRotation = centrifugeRotation * userData.inertiaDelay;
      const angle = userData.initialAngle + delayedRotation;
      const pulse = Math.sin(time * 3 + index) * 0.5 + 0.5;
      const radius = userData.baseRadius + pulse * 0.8;
      sphere.position.set(
        Math.cos(angle) * radius,
        8 + Math.sin(angle * 2) * 2 + pulse * 0.5,
        Math.sin(angle) * radius
      );
      sphere.rotation.x += 0.02;
      sphere.rotation.y += 0.03;
    });

    // 4. CUBES AUTOUR DE LA TIGE 6H (OPPOSITION DE PHASE)
    cubeMeshes.forEach((cube, index) => {
      const userData = cube.userData;
      const delayedRotation = -centrifugeRotation * userData.inertiaDelay;
      const angle = userData.initialAngle + delayedRotation;
      const pulse = Math.sin(time * 4 + index + Math.PI) * 0.5 + 0.5;
      const radius = userData.baseRadius + pulse * 1.0;
      cube.position.set(
        8 + Math.cos(angle * 2) * 2 + pulse * 0.3,
        Math.sin(angle) * radius,
        Math.cos(angle) * radius
      );
      cube.rotation.x += 0.015;
      cube.rotation.z += 0.025;
    });
  }

  function updateLaserLuminescence() {
    const allObjects = [...sphereMeshes, ...cubeMeshes];
    if (allObjects.length === 0) return;
    
    // Réinitialiser
    allObjects.forEach(obj => {
      obj.material.emissive.setHex(0x000000);
      obj.material.emissiveIntensity = 0;
    });
    
    // Luminescence laser synchronisée
    luminescenceIndex += luminescenceSpeed;
    const currentIndex = Math.floor(luminescenceIndex) % allObjects.length;
    const currentObj = allObjects[currentIndex];
    
    if (currentObj) {
      const time = Date.now() * 0.001;
      const hue = (time * 0.5) % 1;
      
      currentObj.material.emissive.setHSL(hue, 1, 0.6);
      currentObj.material.emissiveIntensity = 2.0;
      
      // Traînée laser
      for (let i = 1; i <= 4; i++) {
        const trailIndex = (currentIndex - i + allObjects.length) % allObjects.length;
        const trailObj = allObjects[trailIndex];
        if (trailObj) {
          trailObj.material.emissive.setHSL(hue, 0.8, 0.3);
          trailObj.material.emissiveIntensity = 1.0 / i;
        }
      }
    }
  }

  function animateCentrifugeLaser() {
    if (!animationId) return;
    
    animationId = requestAnimationFrame(animateCentrifugeLaser);
    
    if (centrifugeGroup) {
      updateCentrifugeAnimation();
      updateLaserLuminescence();
    }
    
    renderer.render(scene, camera);
  }

  // Auto-start après initialisation
  setTimeout(() => {
    if (!animationId) {
      console.log("CENTRIFUGE_LASER: Auto-start après initialisation");
      animationId = true;
      animateCentrifugeLaser();
    }
  }, 200);

  return {
    start: () => {
      console.log("CENTRIFUGE_LASER: start() appelé, animationId:", animationId);
      if (!animationId) {
        animationId = true;
        animateCentrifugeLaser();
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
    },
    cleanup: () => {
      console.log("CENTRIFUGE_LASER: Cleanup appelé");
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (centrifugeGroup) {
        while (centrifugeGroup.children.length > 0) {
          const child = centrifugeGroup.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
          centrifugeGroup.remove(child);
        }
      }
      if (scene) {
        scene.clear();
        if (typeof scene.dispose === "function") scene.dispose();
        scene = null;
      }
      if (renderer) {
        renderer.dispose();
        if (typeof renderer.forceContextLoss === "function") renderer.forceContextLoss();
        renderer = null;
      }
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      centrifugeGroup = null;
      laserCenter = null;
      armTop = null;
      armBottom = null;
      sphereMeshes = [];
      cubeMeshes = [];
      centrifugeRotation = 0;
      luminescenceIndex = 0;
      camera = null;
      console.log("CENTRIFUGE_LASER: Cleanup terminé");
    }
  };
}
