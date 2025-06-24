import * as THREE from "three";

let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Objets du MetaCube Oracle
let metaCubeGroup = null;
let kaleidoscopeGroup = null;
let renderTargets = {};
let kaleidoscopeMaterials = {};

// Variables révolutionnaires
let shannonEntropy = 0;
let entropyAccumulator = 0;
let kaleidoscopeRotation = 0;

// Variables pour contrôler la fréquence des requêtes
let cachedFrameData = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 500; // 500ms au lieu de chaque frame

// Event listener reference pour cleanup
let onWindowResize = null;

export function initMetaCubeOracleVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT METACUBE_ORACLE ERROR: Conteneur #${containerId} non trouvé.`);
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

  // Réinitialiser les variables
  cachedFrameData = null;
  lastFetchTime = 0;

  // Initialisation Three.js révolutionnaire
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011);
  
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 50);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Éclairage kaléidoscopique révolutionnaire
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  // Lumières colorées pour effet kaléidoscope
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  colors.forEach((color, index) => {
    const light = new THREE.PointLight(color, 0.8, 100);
    const angle = (index / colors.length) * Math.PI * 2;
    light.position.set(
      Math.cos(angle) * 30,
      Math.sin(angle) * 30,
      Math.sin(angle * 2) * 20
    );
    scene.add(light);
  });

  // Groupes principaux
  metaCubeGroup = new THREE.Group();
  kaleidoscopeGroup = new THREE.Group();
  scene.add(metaCubeGroup);
  scene.add(kaleidoscopeGroup);

  // Création des render targets pour chaque face
  createRenderTargets();

  // Fetch des données révolutionnaires
  fetchMetaCubeOracleData();

  function createRenderTargets() {
    const faces = ['icosahedron', 'cubes', 'spiral_simple', 'spiral_torus', 'centrifuge_laser', 'centrifuge_laser_v2'];
    
    faces.forEach(faceName => {
      renderTargets[faceName] = new THREE.WebGLRenderTarget(512, 512, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
    });
    
    console.log("METACUBE_ORACLE: Render targets créés pour 6 faces");
  }

  function fetchMetaCubeOracleData() {
    fetch("/api/geometry/metacube_oracle/animate")
      .then(res => res.json())
      .then(data => {
        console.log("Données MetaCube Oracle reçues:", data);
        createMetaCubeOracleSystem(data.frames);
        animateMetaCubeOracle();
      })
      .catch(error => {
        console.error('FETCH METACUBE_ORACLE ERROR:', error);
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement du MetaCube Oracle.</p>';
      });
  }

  function createMetaCubeOracleSystem(frames) {
    if (!frames || frames.length === 0) {
      console.error("ERREUR: Aucune frame MetaCube reçue");
      return;
    }
    
    const frameData = frames[0];
    console.log("DEBUG: Premier frame MetaCube:", frameData);
    
    // Stocker les données initiales
    cachedFrameData = frameData;
    
    // 1. CRÉATION DU METACUBE CENTRAL
    createMetaCubeCentral(frameData.metacube);
    
    // 2. CRÉATION DE L'EFFET KALÉIDOSCOPE
    createKaleidoscopeEffect(frameData.kaleidoscope);
    
    // 3. MISE À JOUR DES MÉTRIQUES D'ENTROPIE
    updateEntropyMetrics(frameData);
    
    console.log("METACUBE_ORACLE: Système révolutionnaire créé");
  }

  function createMetaCubeCentral(metaCubeData) {
    // Géométrie du cube central
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    
    // Matériaux pour chaque face avec render targets
    const cubeMaterials = [];
    const faceNames = ['icosahedron', 'cubes', 'spiral_simple', 'spiral_torus', 'centrifuge_laser', 'centrifuge_laser_v2'];
    
    faceNames.forEach((faceName, index) => {
      const material = new THREE.MeshBasicMaterial({
        map: renderTargets[faceName] ? renderTargets[faceName].texture : null,
        transparent: true,
        opacity: 0.9,
        color: new THREE.Color().setHSL(index / faceNames.length, 0.8, 0.6) // Couleur de fallback
      });
      cubeMaterials.push(material);
    });
    
    // Création du cube avec matériaux multiples
    const metaCube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    metaCube.position.set(
      metaCubeData.position[0],
      metaCubeData.position[1],
      metaCubeData.position[2]
    );
    
    metaCubeGroup.add(metaCube);
    
    // Halo énergétique autour du cube
    const haloGeometry = new THREE.SphereGeometry(8, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    metaCube.add(halo);
    
    console.log("METACUBE_ORACLE: Cube central créé avec 6 faces dynamiques");
  }

  function createKaleidoscopeEffect(kaleidoscopeData) {
    // Création des hexagones kaléidoscopiques
    Object.entries(kaleidoscopeData.hexagons).forEach(([faceName, triangles]) => {
      const hexagonGroup = new THREE.Group();
      
      triangles.forEach(triangle => {
        // Géométrie triangulaire pour l'effet kaléidoscope
        const triangleGeometry = new THREE.ConeGeometry(2, 4, 3);
        
        // Matériau avec couleur de fallback
        const triangleMaterial = new THREE.MeshPhongMaterial({
          map: renderTargets[faceName] ? renderTargets[faceName].texture : null,
          transparent: true,
          opacity: 0.7,
          side: triangle.mirror ? THREE.BackSide : THREE.FrontSide,
          color: new THREE.Color().setHSL(triangle.id / 6, 0.8, 0.6)
        });
        
        const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
        triangleMesh.position.set(
          triangle.position[0],
          triangle.position[1],
          triangle.position[2]
        );
        triangleMesh.rotation.set(
          triangle.rotation[0],
          triangle.rotation[1],
          triangle.rotation[2]
        );
        
        hexagonGroup.add(triangleMesh);
      });
      
      // Positionnement des hexagones en cercle autour du cube
      const angle = Object.keys(kaleidoscopeData.hexagons).indexOf(faceName) / Object.keys(kaleidoscopeData.hexagons).length * Math.PI * 2;
      hexagonGroup.position.set(
        Math.cos(angle) * 20,
        Math.sin(angle) * 20,
        0
      );
      
      kaleidoscopeGroup.add(hexagonGroup);
    });
    
    console.log("METACUBE_ORACLE: Effet kaléidoscope créé avec hexagones multiples");
  }

  function updateEntropyMetrics(frameData) {
    shannonEntropy = frameData.shannon_entropy || 0;
    entropyAccumulator = frameData.entropy_accumulator || 0;
    
    // Mise à jour de l'affichage dans l'interface
    const shannonDisplay = document.getElementById('shannon-entropy-display');
    const accumulatorDisplay = document.getElementById('entropy-accumulator-display');
    
    if (shannonDisplay) {
      shannonDisplay.textContent = shannonEntropy.toFixed(4);
    }
    if (accumulatorDisplay) {
      accumulatorDisplay.textContent = entropyAccumulator.toFixed(2);
    }
    
    console.log(`Entropie Shannon: ${shannonEntropy.toFixed(4)}, Accumulateur: ${entropyAccumulator.toFixed(2)}`);
  }

  function updateMetaCubeAnimation() {
    const currentTime = Date.now();
    
    // OPTIMISATION: Fetch seulement toutes les 500ms
    if (currentTime - lastFetchTime > FETCH_INTERVAL) {
      fetch("/api/geometry/metacube_oracle/animate")
        .then(res => res.json())
        .then(data => {
          if (data.frames && data.frames.length > 0) {
            cachedFrameData = data.frames[0];
            updateEntropyMetrics(cachedFrameData);
          }
        })
        .catch(error => {
          console.error('UPDATE METACUBE_ORACLE ERROR:', error);
        });
      lastFetchTime = currentTime;
    }
    
    // Utiliser les données mises en cache pour l'animation fluide
    if (cachedFrameData) {
      animateWithCachedData(cachedFrameData);
    }
  }

  function animateWithCachedData(frameData) {
    const time = Date.now() * 0.001;
    
    // Animation fluide du MetaCube avec interpolation
    if (metaCubeGroup && frameData.metacube) {
      metaCubeGroup.rotation.x = frameData.metacube.rotation[0] + Math.sin(time) * 0.01;
      metaCubeGroup.rotation.y = frameData.metacube.rotation[1] + Math.cos(time) * 0.01;
      metaCubeGroup.rotation.z = frameData.metacube.rotation[2] + Math.sin(time * 0.7) * 0.01;
      
      // Pulsation continue basée sur l'entropie
      const scale = frameData.metacube.scale[0] + Math.sin(time * 2) * 0.05;
      metaCubeGroup.scale.setScalar(scale);
    }
    
    // Animation du kaléidoscope
    if (kaleidoscopeGroup && frameData.kaleidoscope) {
      kaleidoscopeRotation += frameData.kaleidoscope.effect.rotation_speed;
      kaleidoscopeGroup.rotation.z = kaleidoscopeRotation;
      
      // Effet de couleur cyclique
      const colorShift = frameData.kaleidoscope.effect.color_shift;
      kaleidoscopeGroup.children.forEach((hexagon, index) => {
        hexagon.rotation.y += 0.01 * (index + 1);
        
        // Changement de couleur basé sur l'entropie
        hexagon.children.forEach(triangle => {
          if (triangle.material) {
            const hue = (colorShift + index * 0.1) % 1.0;
            triangle.material.color.setHSL(hue, 0.8, 0.6);
          }
        });
      });
    }
  }

  function animateMetaCubeOracle() {
    if (!animationId || !scene || !renderer) return;
    
    animationId = requestAnimationFrame(animateMetaCubeOracle);
    
    // Animation continue optimisée
    updateMetaCubeAnimation();
    
    // Rotation de la caméra pour effet immersif
    const time = Date.now() * 0.0005;
    camera.position.x = Math.cos(time) * 50;
    camera.position.z = Math.sin(time) * 50;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
  }

  // Gestion du redimensionnement
  onWindowResize = () => {
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
  
  window.addEventListener('resize', onWindowResize);
  onWindowResize();

  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animateMetaCubeOracle();
      }
    },
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    isRunning: () => !!animationId,
    resize: onWindowResize,
    cleanup: () => {
      console.log("METACUBE_ORACLE: Cleanup critique appelé");
      
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      if (onWindowResize) {
        window.removeEventListener('resize', onWindowResize);
        onWindowResize = null;
      }
      
      // Disposal des render targets
      Object.values(renderTargets).forEach(renderTarget => {
        if (renderTarget && typeof renderTarget.dispose === 'function') {
          renderTarget.dispose();
        }
      });
      renderTargets = {};
      
      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry && typeof obj.geometry.dispose === 'function') {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => {
                if (mat && typeof mat.dispose === 'function') {
                  mat.dispose();
                }
              });
            } else if (typeof obj.material.dispose === 'function') {
              obj.material.dispose();
            }
          }
        });
        scene.clear();
        if (typeof scene.dispose === 'function') {
          scene.dispose();
        }
        scene = null;
      }
      
      if (renderer) {
        if (typeof renderer.dispose === 'function') {
          renderer.dispose();
        }
        if (typeof renderer.forceContextLoss === 'function') {
          renderer.forceContextLoss();
        }
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer = null;
      }
      
      while (container && container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Réinitialiser les variables
      metaCubeGroup = null;
      kaleidoscopeGroup = null;
      camera = null;
      kaleidoscopeMaterials = {};
      cachedFrameData = null;
      lastFetchTime = 0;
      
      console.log("METACUBE_ORACLE: Cleanup critique terminé");
    }
  };
}
