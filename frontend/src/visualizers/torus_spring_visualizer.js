import * as THREE from "three";

let torusSpringGroup = null;
let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

export function initTorusSpringVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT TORUS_SPRING ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  // NETTOYAGE COMPLET du conteneur
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Réinitialiser les variables globales
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
  torusSpringGroup = null;
  camera = null;

  // Initialisation Three.js
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a); // Fond très sombre pour contraste
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(25, 15, 25); // Position optimale pour voir le tore
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Éclairage avancé pour les ressorts
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 20, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Lumière colorée pour effet dramatique
  const colorLight = new THREE.PointLight(0x00ff88, 0.6, 50);
  colorLight.position.set(0, 0, 15);
  scene.add(colorLight);

  torusSpringGroup = new THREE.Group();
  scene.add(torusSpringGroup);

  // Variables de mouvement et animation
  let systemPosition = new THREE.Vector3(0, 0, 0);
  let systemVelocity = new THREE.Vector3(0.01, 0.015, 0.008);
  let systemRotation = new THREE.Vector3(0, 0, 0);
  let systemRotationSpeed = new THREE.Vector3(0.003, 0.005, 0.007);
  
  const containerLimits = { x: 15, y: 12, z: 12 };
  let luminescenceIndex = 0;
  const luminescenceSpeed = 0.2;
  
  // Stockage des objets pour l'animation
  let sphereMeshes = [];
  let springLines = [];

  // Fetch des données
  fetch("/api/geometry/torus_spring/animate")
    .then(res => res.json())
    .then(data => {
      console.log("Données torus-spring reçues:", data);
      updateTorusSpringGeometry(data);
      animateTorusSpring();
    })
    .catch(error => {
      console.error("FETCH TORUS_SPRING ERROR:", error);
      container.innerHTML = "<p style=\"color: red; text-align: center;\">Erreur de chargement du système tore-ressorts.</p>";
    });

  function updateTorusSpringGeometry(data) {
    if (!torusSpringGroup) return;
    
    // Nettoyer les objets existants
    while (torusSpringGroup.children.length > 0) {
      const child = torusSpringGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      torusSpringGroup.remove(child);
    }

    sphereMeshes = [];
    springLines = [];

    const frameData = data.frames[0];
    const spheres = frameData.spheres;
    const springs = frameData.springs;
    const torusData = frameData.torus;

    console.log(`Création de ${spheres.length} sphères et ${springs.length} ressorts`);

    // 1. Créer le tore de base (structure de référence)
    const torusGeometry = new THREE.TorusGeometry(
      torusData.major_radius, 
      torusData.minor_radius, 
      16, 
      32
    );
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusSpringGroup.add(torusMesh);

    // 2. Créer les sphères
    spheres.forEach((sphere, index) => {
      const sphereGeometry = new THREE.SphereGeometry(sphere.radius * 2, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(sphere.color[0], sphere.color[1], sphere.color[2]),
        emissive: 0x000000,
        emissiveIntensity: 0,
        shininess: 100
      });
      
      const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphereMesh.position.set(
        sphere.position[0],
        sphere.position[1], 
        sphere.position[2]
      );
      
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      
      sphereMesh.userData = { 
        originalColor: new THREE.Color(sphere.color[0], sphere.color[1], sphere.color[2]),
        sphereIndex: index,
        sphereId: sphere.id
      };
      
      torusSpringGroup.add(sphereMesh);
      sphereMeshes.push(sphereMesh);
    });

    // 3. Créer les ressorts (lignes élastiques)
    springs.forEach((spring, index) => {
      const sphere1 = spheres[spring.sphere1];
      const sphere2 = spheres[spring.sphere2];
      
      const points = [];
      points.push(new THREE.Vector3(
        sphere1.position[0], 
        sphere1.position[1], 
        sphere1.position[2]
      ));
      points.push(new THREE.Vector3(
        sphere2.position[0], 
        sphere2.position[1], 
        sphere2.position[2]
      ));

      const springGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const springMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(spring.color[0], spring.color[1], spring.color[2]),
        linewidth: 3,
        transparent: true,
        opacity: 0.8
      });
      
      const springLine = new THREE.Line(springGeometry, springMaterial);
      springLine.userData = {
        springIndex: index,
        sphere1Index: spring.sphere1,
        sphere2Index: spring.sphere2,
        stiffness: spring.stiffness
      };
      
      torusSpringGroup.add(springLine);
      springLines.push(springLine);
    });
  }

  function updateTorusSpringMovement() {
    // ROTATION COMPLEXE du système complet
    systemRotation.add(systemRotationSpeed);
    torusSpringGroup.rotation.set(systemRotation.x, systemRotation.y, systemRotation.z);
    
    // DÉPLACEMENT AVEC INERTIE
    systemPosition.add(systemVelocity);
    torusSpringGroup.position.copy(systemPosition);
    
    // REBONDS avec amortissement
    if (Math.abs(systemPosition.x) > containerLimits.x) {
      systemVelocity.x *= -0.8;
      systemPosition.x = Math.sign(systemPosition.x) * containerLimits.x;
    }
    if (Math.abs(systemPosition.y) > containerLimits.y) {
      systemVelocity.y *= -0.8;
      systemPosition.y = Math.sign(systemPosition.y) * containerLimits.y;
    }
    if (Math.abs(systemPosition.z) > containerLimits.z) {
      systemVelocity.z *= -0.8;
      systemPosition.z = Math.sign(systemPosition.z) * containerLimits.z;
    }
  }

  function updateSpringDeformation() {
    // Animation des ressorts avec déformation élastique
    springLines.forEach((springLine, index) => {
      const userData = springLine.userData;
      const sphere1 = sphereMeshes[userData.sphere1Index];
      const sphere2 = sphereMeshes[userData.sphere2Index];
      
      if (sphere1 && sphere2) {
        // Mise à jour des positions des ressorts
        const points = [];
        points.push(sphere1.position.clone());
        points.push(sphere2.position.clone());
        
        // Effet d'oscillation élastique
        const time = Date.now() * 0.001;
        const oscillation = Math.sin(time * 2 + index * 0.5) * 0.1;
        const midPoint = points[0].clone().lerp(points[1], 0.5);
        const direction = points[1].clone().sub(points[0]).normalize();
        const perpendicular = new THREE.Vector3(-direction.y, direction.x, direction.z);
        
        // Ajouter plusieurs points pour créer un effet de ressort
        const springPoints = [];
        const segments = 8;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const point = points[0].clone().lerp(points[1], t);
          
          // Oscillation sinusoïdale pour simuler les spires du ressort
          const springOscillation = Math.sin(t * Math.PI * 4) * oscillation * userData.stiffness;
          point.add(perpendicular.clone().multiplyScalar(springOscillation));
          
          springPoints.push(point);
        }
        
        springLine.geometry.dispose();
        springLine.geometry = new THREE.BufferGeometry().setFromPoints(springPoints);
      }
    });
  }

  function updateTorusSpringLuminescence() {
    const meshes = sphereMeshes;
    if (meshes.length === 0) return;
    
    // Réinitialiser toutes les sphères
    meshes.forEach(mesh => {
      mesh.material.emissive.setHex(0x000000);
      mesh.material.emissiveIntensity = 0;
    });
    
    // Calculer quelle sphère doit être lumineuse
    luminescenceIndex += luminescenceSpeed;
    const currentIndex = Math.floor(luminescenceIndex) % meshes.length;
    
    // Activer la luminescence sur la sphère courante
    const currentMesh = meshes[currentIndex];
    if (currentMesh) {
      // Couleur lumineuse électrique
      currentMesh.material.emissive.setHex(0x00ffff);
      currentMesh.material.emissiveIntensity = 1.5;
      
      // Effet de propagation sur les sphères connectées
      springLines.forEach(springLine => {
        const userData = springLine.userData;
        if (userData.sphere1Index === currentIndex || userData.sphere2Index === currentIndex) {
          const connectedIndex = userData.sphere1Index === currentIndex ? 
            userData.sphere2Index : userData.sphere1Index;
          
          if (meshes[connectedIndex]) {
            meshes[connectedIndex].material.emissive.setHex(0x0088ff);
            meshes[connectedIndex].material.emissiveIntensity = 0.8;
          }
          
          // Illuminer le ressort connecté
          springLine.material.opacity = 1.0;
          springLine.material.color.setHex(0xffff00);
        } else {
          springLine.material.opacity = 0.6;
          springLine.material.color.setHex(userData.stiffness > 0.4 ? 0xcccc22 : 0x22cccc);
        }
      });
    }
  }

  function animateTorusSpring() {
    if (!animationId) return;
    
    animationId = requestAnimationFrame(animateTorusSpring);
    
    if (torusSpringGroup) {
      // Mouvement et rebonds du système
      updateTorusSpringMovement();
      
      // Déformation élastique des ressorts
      updateSpringDeformation();
      
      // Luminescence propagée
      updateTorusSpringLuminescence();
    }
    
    renderer.render(scene, camera);
  }

  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animateTorusSpring();
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
      if (torusSpringGroup) {
        while (torusSpringGroup.children.length > 0) {
          const child = torusSpringGroup.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
          torusSpringGroup.remove(child);
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
    }
  };
}
