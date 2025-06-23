import * as THREE from "three";

let centrifugeV2Group = null;
let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Objets de la Centrifugeuse V2
let laserCore = null;
let arm12h = null;
let arm6h = null;
let satelliteCentrifuge = null;
let sphereMeshes = [];
let cubeMeshes = [];
let explosionParticles = [];

// Variables d'animation révolutionnaires
let coreSize = 0.4;
let collisionActive = false;
let explosionIntensity = 0;

// Cache pour les données de frame
let cachedFrameData = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 100; // ms

let spherePool = [];
let cubePool = [];

export function initCentrifugeLaserV2Visualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT CENTRIFUGE_LASER_V2 ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  // Nettoyage complet
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (scene) {
    scene.clear();
    scene = null;
  }
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Initialisation Three.js révolutionnaire
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(30, 20, 30);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Éclairage révolutionnaire AMÉLIORÉ
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);
  
  const laserLight = new THREE.SpotLight(0x00ffff, 5, 100, Math.PI / 3, 0.3);
  laserLight.position.set(0, 20, 0);
  laserLight.castShadow = true;
  scene.add(laserLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
  fillLight.position.set(-10, 10, 10);
  scene.add(fillLight);

  centrifugeV2Group = new THREE.Group();
  scene.add(centrifugeV2Group);

  fetchCentrifugeV2Data();

  function fetchCentrifugeV2Data() {
    fetch("/api/geometry/centrifuge_laser_v2/animate")
      .then(res => res.json())
      .then(data => {
        console.log("Données Centrifugeuse Laser V2 reçues:", data);
        createCentrifugeV2System(data.frames);
        animateCentrifugeV2();
      })
      .catch(error => {
        console.error('FETCH CENTRIFUGE_LASER_V2 ERROR:', error);
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement de la Centrifugeuse Laser 2.0.</p>';
      });
  }

  function createCentrifugeV2System(frames) {
    console.log("DEBUG: createCentrifugeV2System appelé avec frames:", frames);
    
    if (!frames || frames.length === 0) {
      console.error("ERREUR: Aucune frame reçue");
      return;
    }
    
    const frameData = frames[0];
    console.log("DEBUG: Premier frame:", frameData);
    
    // 1. NOYAU LASER VARIABLE RÉVOLUTIONNAIRE
    const coreGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x008888,
      emissiveIntensity: 3.0,
      transparent: true,
      opacity: 0.9
    });
    laserCore = new THREE.Mesh(coreGeometry, coreMaterial);
    laserCore.position.set(0, 0, 0);
    centrifugeV2Group.add(laserCore);
    console.log("DEBUG: Noyau laser créé et ajouté à la position:", laserCore.position);

    // Halo révolutionnaire du noyau
    const haloGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    laserCore.add(halo);

    // 2. TIGES RÉVOLUTIONNAIRES
    const armGeometry = new THREE.CylinderGeometry(0.15, 0.08, 15, 16);
    const armMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x888888,
      emissive: 0x002222,
      shininess: 100
    });
    
    // Tige 12H fixe
    arm12h = new THREE.Mesh(armGeometry, armMaterial.clone());
    arm12h.position.set(0, 7.5, 0);
    centrifugeV2Group.add(arm12h);
    console.log("DEBUG: Tige 12H créée à la position:", arm12h.position);

    // Tige 6H mobile révolutionnaire
    arm6h = new THREE.Mesh(armGeometry, armMaterial.clone());
    arm6h.rotation.z = Math.PI / 2;
    arm6h.position.set(7.5, 0, 0);
    centrifugeV2Group.add(arm6h);
    console.log("DEBUG: Tige 6H créée à la position:", arm6h.position);

    // 3. CENTRIFUGEUSE SATELLITE OSCILLANTE
    const satelliteGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const satelliteMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff4400,
      emissive: 0x442200,
      emissiveIntensity: 1.5
    });
    satelliteCentrifuge = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    centrifugeV2Group.add(satelliteCentrifuge);

    // 4. PARTICULES D'EXPLOSION
    createExplosionParticles();

    console.log("CENTRIFUGE_LASER_V2: Système révolutionnaire créé");
  }

  function createExplosionParticles() {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4400,
        transparent: true,
        opacity: 0
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.userData = {
        velocity: new THREE.Vector3(0, 0, 0),
        life: 0
      };
      centrifugeV2Group.add(particle);
      explosionParticles.push(particle);
    }
  }

  function updateCentrifugeV2Animation() {
    const currentTime = Date.now();

    // OPTIMISATION: Fetch seulement toutes les 100ms
    if (currentTime - lastFetchTime > FETCH_INTERVAL) {
      fetch("/api/geometry/centrifuge_laser_v2/animate")
        .then(res => res.json())
        .then(data => {
          if (data.frames && data.frames.length > 0) {
            cachedFrameData = data.frames[0];
          }
        })
        .catch(error => {
          console.error('UPDATE CENTRIFUGE_V2 ERROR:', error);
        });
      lastFetchTime = currentTime;
    }

    // Utiliser les données mises en cache
    if (!cachedFrameData) return;

    const frameData = cachedFrameData;

    // 1. NOYAU VARIABLE - OPTIMISÉ
    if (laserCore && frameData.core) {
      coreSize = frameData.core.size;
      laserCore.scale.setScalar(coreSize / 0.4);
      
      const coreColor = new THREE.Color(
        frameData.core.color[0],
        frameData.core.color[1],
        frameData.core.color[2]
      );
      laserCore.material.color.copy(coreColor);
      laserCore.material.emissiveIntensity = 1.5 + frameData.core.pulsation;

      const halo = laserCore.children[0];
      if (halo) {
        halo.scale.setScalar(coreSize / 0.4);
        halo.material.color.copy(coreColor);
        halo.material.opacity = 0.2 + frameData.core.pulsation * 0.3;
      }
    }

    // 2. TIGES MOBILES - OPTIMISÉ
    if (arm6h && frameData.arms && frameData.arms.arm_6h) {
      arm6h.position.set(
        frameData.arms.arm_6h.position[0],
        frameData.arms.arm_6h.position[1],
        frameData.arms.arm_6h.position[2]
      );
      arm6h.rotation.y = frameData.arms.arm_6h.rotation;
    }

    // 3. CENTRIFUGEUSE SATELLITE - OPTIMISÉ
    if (satelliteCentrifuge && frameData.satellite_centrifuge) {
      satelliteCentrifuge.position.set(
        frameData.satellite_centrifuge.position[0],
        frameData.satellite_centrifuge.position[1],
        frameData.satellite_centrifuge.position[2]
      );
      satelliteCentrifuge.rotation.y = frameData.satellite_centrifuge.oscillation_phase;
    }

    // 4. EXPLOSION ATOMIQUE - OPTIMISÉ
    if (frameData.collision) {
      if (frameData.collision.active && !collisionActive) {
        triggerAtomicExplosion(frameData.collision.intensity);
      }
      collisionActive = frameData.collision.active;
      explosionIntensity = frameData.collision.intensity;
    }

    // 5. Sphères et cubes pooling
    updateSpheresAndCubes(frameData);
  }

  function getFromPool(pool, createFunc) {
    if (pool.length > 0) {
      const obj = pool.pop();
      obj.visible = true;
      return obj;
    }
    return createFunc();
  }

  function returnToPool(pool, obj) {
    obj.visible = false;
    obj.position.set(0, 0, 0);
    pool.push(obj);
  }

  function updateSpheresAndCubes(frameData) {
    // Masquer tous les objets existants
    sphereMeshes.forEach(sphere => sphere.visible = false);
    cubeMeshes.forEach(cube => cube.visible = false);

    // Mettre à jour les sphères existantes ou en créer de nouvelles
    if (frameData.spheres && Array.isArray(frameData.spheres)) {
      frameData.spheres.forEach((sphereData, index) => {
        let sphereMesh;
        if (index < sphereMeshes.length) {
          sphereMesh = sphereMeshes[index];
          sphereMesh.visible = true;
        } else {
          sphereMesh = getFromPool(spherePool, () => {
            const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            return new THREE.Mesh(sphereGeometry, sphereMaterial);
          });
          centrifugeV2Group.add(sphereMesh);
          sphereMeshes.push(sphereMesh);
        }
        
        sphereMesh.position.set(
          sphereData.position[0],
          sphereData.position[1],
          sphereData.position[2]
        );
        sphereMesh.material.color.setRGB(
          sphereData.color[0],
          sphereData.color[1],
          sphereData.color[2]
        );
        sphereMesh.scale.setScalar(sphereData.radius / 0.4);
      });
    }

    // Même logique pour les cubes
    if (frameData.cubes && Array.isArray(frameData.cubes)) {
      frameData.cubes.forEach((cubeData, index) => {
        let cubeMesh;
        if (index < cubeMeshes.length) {
          cubeMesh = cubeMeshes[index];
          cubeMesh.visible = true;
        } else {
          cubeMesh = getFromPool(cubePool, () => {
            const cubeGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            return new THREE.Mesh(cubeGeometry, cubeMaterial);
          });
          centrifugeV2Group.add(cubeMesh);
          cubeMeshes.push(cubeMesh);
        }
        
        cubeMesh.position.set(
          cubeData.position[0],
          cubeData.position[1],
          cubeData.position[2]
        );
        cubeMesh.material.color.setRGB(
          cubeData.color[0],
          cubeData.color[1],
          cubeData.color[2]
        );
      });
    }
  }

  function triggerAtomicExplosion(intensity) {
    console.log(`💥 EXPLOSION ATOMIQUE ! Intensité: ${intensity}`);
    
    explosionParticles.forEach((particle, index) => {
      particle.material.opacity = 1;
      particle.userData.life = 1.0;
      particle.userData.velocity.set(
        (Math.random() - 0.5) * 10 * intensity,
        (Math.random() - 0.5) * 10 * intensity,
        (Math.random() - 0.5) * 10 * intensity
      );
      if (arm6h) {
        particle.position.copy(arm6h.position);
      }
    });

    const explosionLight = scene.children.find(child => 
      child instanceof THREE.PointLight && child.color.r > 0.5
    );
    if (explosionLight) {
      explosionLight.intensity = 5 * intensity;
    }

    camera.position.x += (Math.random() - 0.5) * intensity;
    camera.position.y += (Math.random() - 0.5) * intensity;
  }

  function updateExplosionParticles() {
    explosionParticles.forEach(particle => {
      if (particle.userData.life > 0) {
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.multiplyScalar(0.98);
        particle.userData.life -= 0.02;
        particle.material.opacity = particle.userData.life;
        
        if (particle.userData.life <= 0) {
          particle.material.opacity = 0;
          particle.position.set(0, 0, 0);
        }
      }
    });
  }

  function animateCentrifugeV2() {
    if (!animationId) return;
    
    animationId = requestAnimationFrame(animateCentrifugeV2);

    if (centrifugeV2Group) {
      updateCentrifugeV2Animation();
      updateExplosionParticles();
      centrifugeV2Group.rotation.y += 0.002;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animateCentrifugeV2();
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
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (centrifugeV2Group) {
        while (centrifugeV2Group.children.length > 0) {
          const child = centrifugeV2Group.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
          centrifugeV2Group.remove(child);
        }
      }
      if (scene) {
        scene.clear();
      }
      if (renderer) {
        renderer.dispose();
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
      // Réinitialiser les variables
      sphereMeshes = [];
      cubeMeshes = [];
      explosionParticles = [];
      spherePool = [];
      cubePool = [];
      laserCore = null;
      arm12h = null;
      arm6h = null;
      satelliteCentrifuge = null;
      centrifugeV2Group = null;
      scene = null;
      camera = null;
      renderer = null;
      cachedFrameData = null;
    }
  };
}
