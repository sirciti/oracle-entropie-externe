import * as THREE from "three";

let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Objets du MetaCube Oracle Cinématographique
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

// Configuration des 9 visualiseurs
const VISUALIZERS_CONFIG = {
  // Cube faces (6 visualiseurs)
  cube_faces: [
    { name: 'icosahedron', position: 'front', color: 0xff0000 },
    { name: 'cubes', position: 'back', color: 0x00ff00 },
    { name: 'spiral_simple', position: 'right', color: 0x0000ff },
    { name: 'spiral_torus', position: 'left', color: 0xffff00 },
    { name: 'centrifuge_laser', position: 'top', color: 0xff00ff },
    { name: 'centrifuge_laser_v2', position: 'bottom', color: 0x00ffff }
  ],
  // Surfaces flottantes (3 visualiseurs)
  floating_surfaces: [
    { name: 'torus_spring', position: [25, 0, 0], rotation: [0, Math.PI/2, 0], color: 0xffa500 },
    { name: 'crypto_token_river', position: [-25, 0, 0], rotation: [0, -Math.PI/2, 0], color: 0x9400d3 },
    { name: 'stream', position: [0, 25, 0], rotation: [Math.PI/2, 0, 0], color: 0x32cd32 }
  ]
};

// Event listener reference pour cleanup
let onWindowResize = null;

export function initMetaCubeOracleVisualizerV2(containerId) {
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

  // Initialisation Three.js cinématographique
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000008); // Noir spatial profond
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, 40);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance" // Performance GPU maximale
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Qualité HD
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Couleurs cinématographiques (Three.js r152+)
  container.appendChild(renderer.domElement);

  // Éclairage cinématographique style Inception
  setupCinematicLighting();

  // Groupes principaux
  metaCubeGroup = new THREE.Group();
  floatingSurfacesGroup = new THREE.Group();
  scene.add(metaCubeGroup);
  scene.add(floatingSurfacesGroup);

  // Création des render targets HD pour chaque visualiseur
  createHDRenderTargets();

  // Création des scènes individuelles pour chaque visualiseur
  createVisualizerScenes();

  // Fetch des données révolutionnaires
  fetchMetaCubeOracleData();

  function setupCinematicLighting() {
    // Éclairage ambiant doux
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Lumière principale style cinéma
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(20, 20, 20);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Lumière de remplissage
    const fillLight = new THREE.DirectionalLight(0x4444ff, 0.7);
    fillLight.position.set(-20, 10, -10);
    scene.add(fillLight);

    // Lumières colorées pour effet dramatique
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

  function createHDRenderTargets() {
    // Render targets HD pour tous les visualiseurs
    [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces].forEach(config => {
      renderTargets[config.name] = new THREE.WebGLRenderTarget(1024, 1024, { // HD 1024x1024
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        colorSpace: THREE.SRGBColorSpace // Three.js r152+
      });
    });
    
    console.log("METACUBE_ORACLE: Render targets HD créés pour 9 visualiseurs");
  }

  function createVisualizerScenes() {
    // Créer des scènes individuelles pour chaque visualiseur
    [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces].forEach(config => {
      // Scène individuelle
      visualizerScenes[config.name] = new THREE.Scene();
      visualizerScenes[config.name].background = new THREE.Color(0x000000);
      
      // Caméra individuelle
      visualizerCameras[config.name] = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      visualizerCameras[config.name].position.set(0, 0, 20);
      visualizerCameras[config.name].lookAt(0, 0, 0);
      
      // Éclairage pour la scène individuelle
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
        createCinematicMetaCubeSystem(data.frames);
        animateMetaCubeOracle();
      })
      .catch(error => {
        console.error('FETCH METACUBE_ORACLE ERROR:', error);
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement du MetaCube Oracle Cinématographique.</p>';
      });
  }

  function createCinematicMetaCubeSystem(frames) {
    if (!frames || frames.length === 0) {
      console.error("ERREUR: Aucune frame MetaCube reçue");
      return;
    }
    
    const frameData = frames[0];
    console.log("DEBUG: Premier frame MetaCube Cinématographique:", frameData);
    
    // Stocker les données initiales
    cachedFrameData = frameData;
    
    // 1. CRÉATION DU CUBE CENTRAL AVEC 6 FACES HD
    createCinematicCube(frameData.metacube);
    
    // 2. CRÉATION DES 3 SURFACES FLOTTANTES
    createFloatingSurfaces(frameData);
    
    // 3. MISE À JOUR DES MÉTRIQUES D'ENTROPIE
    updateEntropyMetrics(frameData);
    
    console.log("METACUBE_ORACLE: Système cinématographique créé avec 9 visualiseurs");
  }

  function createCinematicCube(metaCubeData) {
    // Géométrie du cube central cinématographique
    const cubeGeometry = new THREE.BoxGeometry(20, 20, 20);
    
    // Matériaux HD pour chaque face du cube
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
    
    // Création du cube avec matériaux HD
    const cinematicCube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cinematicCube.position.set(
      metaCubeData.position[0],
      metaCubeData.position[1],
      metaCubeData.position[2]
    );
    
    metaCubeGroup.add(cinematicCube);
    
    // Halo énergétique style Inception
    const haloGeometry = new THREE.SphereGeometry(18, 64, 64);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    cinematicCube.add(halo);
    
    // Anneaux de données style Inception
    for (let i = 0; i < 5; i++) {
      const ringGeometry = new THREE.TorusGeometry(25 + i * 4, 0.4, 8, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(i / 5, 0.8, 0.6),
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2 + i * Math.PI / 10;
      ring.rotation.y = i * Math.PI / 8;
      cinematicCube.add(ring);
    }
    
    console.log("METACUBE_ORACLE: Cube cinématographique créé avec 6 faces HD");
  }

  function createFloatingSurfaces(frameData) {
    VISUALIZERS_CONFIG.floating_surfaces.forEach((config, index) => {
      // Géométrie de surface flottante
      const surfaceGeometry = new THREE.PlaneGeometry(16, 16);
      
      // Matériau HD avec texture du visualiseur
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
      
      // Cadre énergétique autour de la surface
      const frameGeometry = new THREE.RingGeometry(8, 9, 32);
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      surface.add(frame);
      
      // Particules autour de la surface
      for (let p = 0; p < 10; p++) {
        const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
          color: config.color,
          transparent: true,
          opacity: 0.6
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        );
        surface.add(particle);
      }
      
      floatingSurfacesGroup.add(surface);
    });
    
    console.log("METACUBE_ORACLE: 3 surfaces flottantes créées");
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

  function renderVisualizersToTextures() {
    // Rendu de chaque visualiseur dans sa texture HD
    [...VISUALIZERS_CONFIG.cube_faces, ...VISUALIZERS_CONFIG.floating_surfaces].forEach(config => {
      if (visualizerScenes[config.name] && visualizerCameras[config.name] && renderTargets[config.name]) {
        // Créer du contenu dynamique pour chaque visualiseur
        updateVisualizerContent(config.name);
        
        // Rendu vers la texture
        renderer.setRenderTarget(renderTargets[config.name]);
        renderer.render(visualizerScenes[config.name], visualizerCameras[config.name]);
      }
    });
    
    // Retour au rendu principal
    renderer.setRenderTarget(null);
  }

  function updateVisualizerContent(visualizerName) {
    const scene = visualizerScenes[visualizerName];
    const time = cinematicTime;
    
    // Nettoyer la scène (garder les lumières)
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
    
    // Créer du contenu dynamique basé sur le type de visualiseur
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
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 50 + time * 0.1) % 1, 1.0, 0.7),
        emissive: new THREE.Color().setHSL((i / 50 + time * 0.1) % 1, 0.5, 0.2)
      });
      const sphere = new THREE.Mesh(geometry, material);
      const t = i / 50 * Math.PI * 4 + time;
      sphere.position.set(
        Math.cos(t) * (5 + i * 0.1),
        Math.sin(t) * (5 + i * 0.1),
        i * 0.3 - 7.5
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
    // Noyau central
    const coreGeometry = new THREE.SphereGeometry(2, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x004444,
      emissiveIntensity: 1.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);
    
    // Tiges rotatives
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
    // Version améliorée avec particules
    createCentrifugeContent(scene, time);
    
    // Particules d'explosion
    for (let i = 0; i < 20; i++) {
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
    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i / 30 + time * 0.2) % 1, 1.0, 0.7),
        emissive: new THREE.Color().setHSL((i / 30 + time * 0.2) % 1, 0.5, 0.2)
      });
      const token = new THREE.Mesh(geometry, material);
      const flow = time * 2 + i * 0.2;
      token.position.set(
        Math.sin(flow) * 8,
        (i - 15) * 0.5,
        Math.cos(flow) * 6
      );
      token.rotation.set(flow, flow * 0.7, flow * 0.3);
      scene.add(token);
    }
  }

  function createStreamContent(scene, time) {
    for (let i = 0; i < 40; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL((time * 0.1 + i * 0.025) % 1, 1.0, 0.8),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);
      const stream = time + i * 0.1;
      particle.position.set(
        Math.sin(stream) * 6,
        Math.cos(stream * 1.3) * 4,
        (i - 20) * 0.4
      );
      scene.add(particle);
    }
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
    cinematicTime = Date.now() * 0.001;
    
    // Animation cinématographique du cube central
    if (metaCubeGroup && frameData.metacube) {
      metaCubeGroup.rotation.x = frameData.metacube.rotation[0] + cinematicTime * 0.2;
      metaCubeGroup.rotation.y = frameData.metacube.rotation[1] + cinematicTime * 0.3;
      metaCubeGroup.rotation.z = frameData.metacube.rotation[2] + cinematicTime * 0.1;
      
      // Pulsation basée sur l'entropie
      const scale = frameData.metacube.scale[0] + Math.sin(cinematicTime * 2) * 0.05;
      metaCubeGroup.scale.setScalar(scale);
    }
    
    // Animation des surfaces flottantes avec transitions Inception
    if (floatingSurfacesGroup) {
      floatingSurfacesGroup.children.forEach((surface, index) => {
        surface.rotation.x += 0.005 * (index + 1);
        surface.rotation.y += 0.008 * (index + 1);
        
        // Mouvement orbital style Inception
        const orbit = cinematicTime * 0.1 + index * Math.PI * 2 / 3;
        const radius = 25 + Math.sin(cinematicTime + index) * 5;
        surface.position.x = Math.cos(orbit) * radius;
        surface.position.z = Math.sin(orbit) * radius;
        surface.position.y = Math.sin(cinematicTime * 0.5 + index) * 10;
        
        // Effet de morphing sur l'opacité
        surface.material.opacity = 0.8 + Math.sin(cinematicTime * 3 + index) * 0.2;
        
        // Animation des particules autour des surfaces
        surface.children.forEach((child, childIndex) => {
          if (childIndex > 0) { // Skip le frame, animer les particules
            child.rotation.x += 0.02;
            child.rotation.y += 0.03;
            child.position.x += Math.sin(cinematicTime + childIndex) * 0.1;
            child.position.y += Math.cos(cinematicTime + childIndex) * 0.1;
          }
        });
      });
    }
  }

  function animateMetaCubeOracle() {
    if (!animationId || !scene || !renderer) return;
    
    animationId = requestAnimationFrame(animateMetaCubeOracle);
    
    // Rendu des visualiseurs vers les textures HD
    renderVisualizersToTextures();
    
    // Animation continue optimisée
    updateMetaCubeAnimation();
    
    // Caméra cinématographique style Inception
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

  function cleanup() {
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
    
    // Disposal des scènes individuelles
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
    
    // Réinitialiser les variables
    metaCubeGroup = null;
    floatingSurfacesGroup = null;
    camera = null;
    cachedFrameData = null;
    lastFetchTime = 0;
    cinematicTime = 0;
    
    console.log("METACUBE_ORACLE: Cleanup critique terminé");
  }

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
    cleanup: cleanup
  };
}
