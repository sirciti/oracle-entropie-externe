import * as THREE from "three";

let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Objets du MetaCube Oracle
let metaCubeGroup = null;
let floatingSurfacesGroup = null;
let renderTargets = {};
let visualizerScenes = {};
let visualizerCameras = {};

// Variables révolutionnaires
let shannonEntropy = 0;
let entropyAccumulator = 0;
let cinematicTime = 0;

// Variables pour contrôler la fréquence des requêtes
let cachedFrameData = null;
let lastFetchTime = 0;
const FETCH_INTERVAL = 500;

// Variables pour optimisation
let TARGET_FPS = 30;
let FRAME_SKIP = 2;
let frameSkipCounter = 0;
let lastFrameTime = 0;

// Configuration des 9 visualiseurs
const VISUALIZERS_CONFIG = {
  cube_faces: [
    { name: 'icosahedron', position: 'front', color: 0xff0000 },
    { name: 'cubes', position: 'back', color: 0x00ff00 },
    { name: 'spiral_simple', position: 'right', color: 0x0000ff },
    { name: 'spiral_torus', position: 'left', color: 0xffff00 },
    { name: 'centrifuge_laser', position: 'top', color: 0xff00ff },
    { name: 'centrifuge_laser_v2', position: 'bottom', color: 0x00ffff }
  ],
  floating_surfaces: [
    { name: 'torus_spring', position: [25, 0, 0], rotation: [0, Math.PI/2, 0], color: 0xffa500 },
    { name: 'crypto_token_river', position: [-25, 0, 0], rotation: [0, -Math.PI/2, 0], color: 0x9400d3 },
    { name: 'stream', position: [0, 25, 0], rotation: [Math.PI/2, 0, 0], color: 0x32cd32 }
  ]
};

// Variables pour alternance automatique
let currentVersion = 1; // 1 = Version optimisée, 2 = Version cinématographique
let slideshowTimer = null;
const SLIDESHOW_INTERVAL = 10000; // 10 secondes par version
let isSlideshow = false;

// Event listener reference pour cleanup
let onWindowResize = null;

export function initMetaCubeOracleVisualizerV4(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT METACUBE_ORACLE ERROR: Conteneur #${containerId} non trouvé.`);
    return null;
  }

  // Nettoyage complet
  cleanup();

  // Réinitialiser les variables
  cachedFrameData = null;
  lastFetchTime = 0;
  cinematicTime = 0;
  frameSkipCounter = 0;
  lastFrameTime = 0;

  // Initialisation Three.js
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000008);
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, 40);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Couleurs cinématographiques (Three.js r152+)
  container.appendChild(renderer.domElement);

  // Éclairage
  setupLighting();

  // Groupes principaux
  metaCubeGroup = new THREE.Group();
  floatingSurfacesGroup = new THREE.Group();
  scene.add(metaCubeGroup);
  scene.add(floatingSurfacesGroup);

  // Création des render targets
  createRenderTargets();

  // Création des scènes individuelles
  createVisualizerScenes();

  // Fetch initial des données
  fetchMetaCubeOracleData();

  // Setup initial version
  displayCurrentVersion();

  function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(20, 20, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.7);
    fillLight.position.set(-20, 10, -10);
    scene.add(fillLight);

    const dramaticColors = [0xff0040, 0x0040ff, 0x40ff00, 0xff4000, 0x4000ff, 0x00ff40];
    dramaticColors.forEach((color, index) => {
      const light = new THREE.PointLight(color, 1.0, 120);
      const angle = (index / dramaticColors.length) * Math.PI * 2;
      light.position.set(
        Math.cos(angle) * 35,
        Math.sin(angle) * 35,
        Math.sin(angle * 2) * 25
      );
      scene.add(light);
    });
  }

  function createRenderTargets() {
    [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces].forEach(config => {
      renderTargets[config.name] = new THREE.WebGLRenderTarget(256, 256, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        colorSpace: THREE.SRGBColorSpace // Three.js r152+
      });
    });
    console.log("METACUBE_ORACLE: Render targets créés pour 9 visualiseurs");
  }

  function createVisualizerScenes() {
    [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces].forEach(config => {
      visualizerScenes[config.name] = new THREE.Scene();
      visualizerScenes[config.name].background = new THREE.Color(0x000000);
      
      visualizerCameras[config.name] = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      visualizerCameras[config.name].position.set(0, 0, 20);
      visualizerCameras[config.name].lookAt(0, 0, 0);
      
      const sceneLight = new THREE.AmbientLight(0xffffff, 0.8);
      visualizerScenes[config.name].add(sceneLight);
      
      const directionalLight = new THREE.DirectionalLight(config.color, 1.0);
      directionalLight.position.set(10, 10, 10);
      visualizerScenes[config.name].add(directionalLight);
    });
    console.log("METACUBE_ORACLE: Scènes individuelles créées pour 9 visualiseurs");
  }

  function fetchMetaCubeOracleData() {
    fetch("/api/geometry/metacube_oracle/animate")
      .then(res => res.json())
      .then(data => {
        console.log("Données MetaCube Oracle reçues:", data);
        createMetaCubeSystem(data.frames);
        animate();
      })
      .catch(error => {
        console.error('FETCH METACUBE_ORACLE ERROR:', error);
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement du MetaCube Oracle.</p>';
      });
  }

  function createMetaCubeSystem(frames) {
    if (!frames || frames.length === 0) {
      console.error("ERREUR: Aucune frame MetaCube reçue");
      return;
    }
    
    const frameData = frames[0];
    cachedFrameData = frameData;
    
    createCube(frameData.metacube);
    createFloatingSurfaces(frameData);
    updateEntropyMetrics(frameData);
    
    console.log("METACUBE_ORACLE: Système créé avec 9 visualiseurs");
  }

  function createCube(metaCubeData) {
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    const cubeMaterials = [];
    
    VISUALIZERS_CONFIG.cube_faces.forEach((config, index) => {
      const material = new THREE.MeshPhongMaterial({
        map: renderTargets[config.name].texture,
        transparent: true,
        opacity: 0.95,
        color: new THREE.Color(config.color).multiplyScalar(0.8),
        emissive: new THREE.Color(config.color).multiplyScalar(0.2),
        shininess: 150,
        side: THREE.FrontSide
      });
      cubeMaterials.push(material);
    });
    
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cube.position.set(
      metaCubeData.position[0],
      metaCubeData.position[1],
      metaCubeData.position[2]
    );
    
    metaCubeGroup.add(cube);
    
    // Halo
    const haloGeometry = new THREE.SphereGeometry(18, 32, 32);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    cube.add(halo);
    
    console.log("METACUBE_ORACLE: Cube central créé");
  }

  function createFloatingSurfaces(frameData) {
    VISUALIZERS_CONFIG.floating_surfaces.forEach((config, index) => {
      const surfaceGeometry = new THREE.PlaneGeometry(16, 16);
      const surfaceMaterial = new THREE.MeshPhongMaterial({
        map: renderTargets[config.name].texture,
        transparent: true,
        opacity: 0.9,
        color: new THREE.Color(config.color).multiplyScalar(0.8),
        emissive: new THREE.Color(config.color).multiplyScalar(0.3),
        side: THREE.DoubleSide
      });
      
      const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
      surface.position.set(...config.position);
      surface.rotation.set(...config.rotation);
      
      floatingSurfacesGroup.add(surface);
    });
    console.log("METACUBE_ORACLE: 3 surfaces flottantes créées");
  }

  function updateEntropyMetrics(frameData) {
    shannonEntropy = frameData.shannon_entropy || 0;
    entropyAccumulator = frameData.entropy_accumulator || 0;
    
    const shannonDisplay = document.getElementById('shannon-entropy-display');
    const accumulatorDisplay = document.getElementById('entropy-accumulator-display');
    
    if (shannonDisplay) {
      shannonDisplay.textContent = shannonEntropy.toFixed(4);
    }
    if (accumulatorDisplay) {
      accumulatorDisplay.textContent = entropyAccumulator.toFixed(2);
    }
  }

  // Diaporama automatique
  function startSlideshow() {
    if (isSlideshow) return;
    isSlideshow = true;
    console.log("🎬 DIAPORAMA METACUBE: Démarrage automatique");
    slideshowTimer = setInterval(() => {
      switchToNextVersion();
    }, SLIDESHOW_INTERVAL);
    displayCurrentVersion();
  }

  function stopSlideshow() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    isSlideshow = false;
    console.log("🎬 DIAPORAMA METACUBE: Arrêté");
  }

  function switchToNextVersion() {
    currentVersion = currentVersion === 1 ? 2 : 1;
    displayCurrentVersion();
    console.log(`🎬 DIAPORAMA METACUBE: Passage à la version ${currentVersion}`);
    
    // Mettre à jour l'affichage
    const versionDisplay = document.getElementById('current-version-display');
    if (versionDisplay) {
      versionDisplay.textContent = currentVersion === 1 ? 'Optimisée' : 'Cinématographique';
    }
  }

  function displayCurrentVersion() {
    if (currentVersion === 1) {
      setupOptimizedVersion();
    } else {
      setupCinematicVersion();
    }
  }

  // Version Optimisée
  function setupOptimizedVersion() {
    console.log("⚡ METACUBE: Version Optimisée Performance");
    Object.values(renderTargets).forEach(target => {
      target.setSize(256, 256);
    });
    TARGET_FPS = 30;
    FRAME_SKIP = 2;
  }

  // Version Cinématographique
  function setupCinematicVersion() {
    console.log("🎬 METACUBE: Version Cinématographique HD");
    Object.values(renderTargets).forEach(target => {
      target.setSize(512, 512);
    });
    TARGET_FPS = 60;
    FRAME_SKIP = 1;
  }

  // Rendu des visualiseurs
  function renderVisualizersToTextures() {
    const configs = [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces];
    const batchSize = currentVersion === 1 ? 2 : 3; // Optimisé vs Cinématographique
    const frameIndex = Math.floor(cinematicTime * TARGET_FPS) % Math.ceil(configs.length / batchSize);
    
    const startIndex = frameIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, configs.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const config = configs[i];
      if (visualizerScenes[config.name] && visualizerCameras[config.name] && renderTargets[config.name]) {
        updateVisualizerContent(config.name);
        
        renderer.setRenderTarget(renderTargets[config.name]);
        renderer.render(visualizerScenes[config.name], visualizerCameras[config.name]);
      }
    }
    
    renderer.setRenderTarget(null);
  }

  function updateVisualizerContent(visualizerName) {
    const scene = visualizerScenes[visualizerName];
    const time = cinematicTime;
    
    // Nettoyer la scène
    while (scene.children.length > 2) {
      const child = scene.children[2];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
      scene.remove(child);
    }
    
    // Créer du contenu selon le type
    switch (visualizerName) {
      case 'icosahedron':
        createIcosahedronContent(scene, time);
        break;
      case 'cubes':
        createCubesContent(scene, time);
        break;
      case 'spiral_simple':
        createSpiralContent(scene, time);
        break;
      case 'spiral_torus':
        createTorusContent(scene, time);
        break;
      case 'centrifuge_laser':
        createCentrifugeContent(scene, time);
        break;
      case 'centrifuge_laser_v2':
        createCentrifugeV2Content(scene, time);
        break;
      case 'torus_spring':
        createTorusSpringContent(scene, time);
        break;
      case 'crypto_token_river':
        createCryptoRiverContent(scene, time);
        break;
      case 'stream':
        createStreamContent(scene, time);
        break;
    }
  }

  function createIcosahedronContent(scene, time) {
    const geometry = new THREE.IcosahedronGeometry(8, 1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((time * 0.1) % 1, 0.8, 0.6),
      wireframe: Math.sin(time * 2) > 0,
      emissive: new THREE.Color().setHSL((time * 0.1) % 1, 0.5, 0.2)
    });
    const icosahedron = new THREE.Mesh(geometry, material);
    icosahedron.rotation.set(time * 0.5, time * 0.3, time * 0.7);
    scene.add(icosahedron);
  }

  function createCubesContent(scene, time) {
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 8 + time * 0.1) % 1, 0.8, 0.6),
        emissive: new THREE.Color().setHSL((i / 8 + time * 0.1) % 1, 0.3, 0.1)
      });
      const cube = new THREE.Mesh(geometry, material);
      const angle = (i / 8) * Math.PI * 2 + time * 0.5;
      cube.position.set(
        Math.cos(angle) * 6,
        Math.sin(angle) * 6,
        Math.sin(time + i) * 3
      );
      cube.rotation.set(time + i, time * 0.7 + i, time * 0.3 + i);
      scene.add(cube);
    }
  }

  function createSpiralContent(scene, time) {
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 30 + time * 0.1) % 1, 1.0, 0.7),
        emissive: new THREE.Color().setHSL((i / 30 + time * 0.1) % 1, 0.5, 0.2)
      });
      const sphere = new THREE.Mesh(geometry, material);
      const t = i / 30 * Math.PI * 4 + time;
      sphere.position.set(
        Math.cos(t) * (5 + i * 0.1),
        Math.sin(t) * (5 + i * 0.1),
        i * 0.3 - 4.5
      );
      scene.add(sphere);
    }
  }

  function createTorusContent(scene, time) {
    const geometry = new THREE.TorusGeometry(6, 2, 16, 100);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((time * 0.1) % 1, 0.8, 0.6),
      emissive: new THREE.Color().setHSL((time * 0.1) % 1, 0.3, 0.1)
    });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.set(time * 0.3, time * 0.5, time * 0.2);
    scene.add(torus);
  }

  function createCentrifugeContent(scene, time) {
    const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x004444,
      emissiveIntensity: 1.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);
    
    for (let i = 0; i < 4; i++) {
      const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 12, 8);
      const armMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        emissive: 0x222222
      });
      const arm = new THREE.Mesh(armGeometry, armMaterial);
      const angle = (i / 4) * Math.PI * 2 + time * 2;
      arm.position.set(Math.cos(angle) * 6, 0, Math.sin(angle) * 6);
      arm.rotation.z = angle;
      scene.add(arm);
    }
  }

  function createCentrifugeV2Content(scene, time) {
    createCentrifugeContent(scene, time);
    
    for (let i = 0; i < 15; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1.0, 0.8),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );
      scene.add(particle);
    }
  }

  function createTorusSpringContent(scene, time) {
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(4 + i * 2, 0.5, 8, 32);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 3 + time * 0.1) % 1, 0.8, 0.6),
        emissive: new THREE.Color().setHSL((i / 3 + time * 0.1) % 1, 0.3, 0.1)
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.rotation.set(time * (0.3 + i * 0.1), time * (0.2 + i * 0.1), 0);
      scene.add(torus);
    }
  }

  function createCryptoRiverContent(scene, time) {
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 20 + time * 0.2) % 1, 1.0, 0.7),
        emissive: new THREE.Color().setHSL((i / 20 + time * 0.2) % 1, 0.5, 0.2)
      });
      const token = new THREE.Mesh(geometry, material);
      const flow = time * 2 + i * 0.2;
      token.position.set(
        Math.sin(flow) * 8,
        (i - 10) * 0.5,
        Math.cos(flow) * 6
      );
      token.rotation.set(flow, flow * 0.7, flow * 0.3);
      scene.add(token);
    }
  }

  function createStreamContent(scene, time) {
    for (let i = 0; i < 25; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL((time * 0.1 + i * 0.04) % 1, 1.0, 0.8),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);
      const stream = time + i * 0.1;
      particle.position.set(
        Math.sin(stream) * 6,
        Math.cos(stream * 1.3) * 4,
        (i - 12.5) * 0.4
      );
      scene.add(particle);
    }
  }

  function updateMetaCubeAnimation() {
    const currentTime = Date.now();
    
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
    
    if (cachedFrameData) {
      animateWithCachedData(cachedFrameData);
    }
  }

  function animateWithCachedData(frameData) {
    cinematicTime = Date.now() * 0.001;
    
    if (metaCubeGroup && frameData.metacube) {
      metaCubeGroup.rotation.x = frameData.metacube.rotation[0] + cinematicTime * 0.2;
      metaCubeGroup.rotation.y = frameData.metacube.rotation[1] + cinematicTime * 0.3;
      metaCubeGroup.rotation.z = frameData.metacube.rotation[2] + cinematicTime * 0.1;
      
      const scale = frameData.metacube.scale[0] + Math.sin(cinematicTime * 2) * 0.05;
      metaCubeGroup.scale.setScalar(scale);
    }
    
    if (floatingSurfacesGroup) {
      floatingSurfacesGroup.children.forEach((surface, index) => {
        surface.rotation.x += 0.005 * (index + 1);
        surface.rotation.y += 0.008 * (index + 1);
        
        const orbit = cinematicTime * 0.1 + index * Math.PI * 2 / 3;
        const radius = 25 + Math.sin(cinematicTime + index) * 5;
        surface.position.x = Math.cos(orbit) * radius;
        surface.position.z = Math.sin(orbit) * radius;
        surface.position.y = Math.sin(cinematicTime * 0.5 + index) * 10;
        
        surface.material.opacity = 0.8 + Math.sin(cinematicTime * 3 + index) * 0.2;
      });
    }
  }

  // Fonction d'animation principale
  function animate() {
    if (!animationId) return;
    
    animationId = requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    
    // Limitation FPS
    frameSkipCounter++;
    if (frameSkipCounter < FRAME_SKIP) {
      return;
    }
    frameSkipCounter = 0;
    
    if (currentTime - lastFrameTime < FRAME_INTERVAL) {
      return;
    }
    lastFrameTime = currentTime;
    
    // Rendu des visualiseurs vers les textures
    renderVisualizersToTextures();
    
    // Animation continue
    updateMetaCubeAnimation();
    
    // Caméra cinématographique
    const time = Date.now() * 0.0002;
    const radius = 50 + Math.sin(time * 0.5) * 20;
    camera.position.x = Math.cos(time) * radius;
    camera.position.y = Math.sin(time * 0.7) * 20;
    camera.position.z = Math.sin(time) * radius;
    camera.lookAt(0, 0, 0);
    
    // Rendu principal
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

  // Event listeners pour les contrôles diaporama
  setTimeout(() => {
    const startBtn = document.getElementById('start-slideshow');
    const stopBtn = document.getElementById('stop-slideshow');
    const nextBtn = document.getElementById('next-version');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        startSlideshow();
        const versionDisplay = document.getElementById('current-version-display');
        if (versionDisplay) {
          versionDisplay.textContent = currentVersion === 1 ? 'Optimisée' : 'Cinématographique';
        }
      });
    }
    
    if (stopBtn) {
      stopBtn.addEventListener('click', stopSlideshow);
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        switchToNextVersion();
      });
    }
  }, 100);

  function cleanup() {
    console.log("METACUBE_ORACLE: Cleanup critique appelé");
    
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
    
    if (onWindowResize) {
      window.removeEventListener('resize', onWindowResize);
      onWindowResize = null;
    }
    
    Object.values(renderTargets).forEach(target => {
      if (target && typeof target.dispose === 'function') {
        target.dispose();
      }
    });
    renderTargets = {};
    
    Object.values(visualizerScenes).forEach(scene => {
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
      }
    });
    visualizerScenes = {};
    visualizerCameras = {};
    
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
    
    const container = document.getElementById(containerId);
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
    
    metaCubeGroup = null;
    floatingSurfacesGroup = null;
    camera = null;
    cachedFrameData = null;
    lastFetchTime = 0;
    cinematicTime = 0;
    frameSkipCounter = 0;
    lastFrameTime = 0;
    isSlideshow = false;
    
    console.log("METACUBE_ORACLE: Cleanup critique terminé");
  }

  // Retour des méthodes publiques
  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animate();
      }
    },
    stop: () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      stopSlideshow();
    },
    isRunning: () => !!animationId,
    resize: onWindowResize,
    cleanup: cleanup,
    startSlideshow: startSlideshow,
    stopSlideshow: stopSlideshow,
    switchToNextVersion: switchToNextVersion
  };
}
