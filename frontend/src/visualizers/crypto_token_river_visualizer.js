import * as THREE from "three";

let riverGroup = null;
let scene = null;
let camera = null;
let renderer = null;
let animationId = null;

// Variables de la rivière crypto
let tokenParticles = [];
let riverVelocity = 0.05;
let currentTokens = [];

export function initCryptoTokenRiverVisualizer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`INIT CRYPTO_TOKEN_RIVER ERROR: Conteneur #${containerId} non trouvé.`);
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

  // Initialisation Three.js
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000011); // Bleu très sombre pour effet cyber
  
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Éclairage cyber pour la rivière
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  riverGroup = new THREE.Group();
  scene.add(riverGroup);

  // Fetch de la rivière crypto
  fetchCryptoTokenRiver();

  function fetchCryptoTokenRiver() {
    fetch("/api/geometry/crypto_token_river/animate")
      .then(res => res.json())
      .then(data => {
        console.log("Données CryptoTokenRiver reçues:", data);
        createCryptoTokenRiver(data.frames);
        animateCryptoTokenRiver();
      })
      .catch(error => {
        console.error('FETCH CRYPTO_TOKEN_RIVER ERROR:', error);
        container.innerHTML = '<p style="color: red; text-align: center;">Erreur de chargement de la rivière crypto.</p>';
      });
  }

  function createCryptoTokenRiver(frames) {
    // Créer les particules pour la rivière crypto
    frames.forEach((frame, frameIndex) => {
      frame.tokens.forEach((token, tokenIndex) => {
        // Géométrie de particule crypto
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color(token.color[0], token.color[1], token.color[2]),
          emissive: new THREE.Color(token.color[0] * 0.3, token.color[1] * 0.3, token.color[2] * 0.3),
          transparent: true,
          opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        // Position initiale dans la rivière
        const x = (tokenIndex - frame.tokens.length / 2) * 0.3;
        const y = Math.sin(tokenIndex * 0.5) * 2;
        const z = -frameIndex * 2;
        
        particle.position.set(x, y, z);
        particle.userData = {
          char: token.char,
          velocity: token.velocity,
          originalColor: new THREE.Color(token.color[0], token.color[1], token.color[2]),
          tokenIndex: tokenIndex,
          frameIndex: frameIndex
        };
        
        riverGroup.add(particle);
        tokenParticles.push(particle);
      });
    });

    console.log(`CRYPTO_TOKEN_RIVER: ${tokenParticles.length} particules crypto créées`);
  }

  function updateCryptoRiverFlow() {
    // Animation du flux continu de la rivière crypto
    tokenParticles.forEach((particle, index) => {
      // Mouvement vers l'avant (flux continu de la rivière)
      particle.position.z += riverVelocity * particle.userData.velocity;
      
      // Oscillation latérale pour effet organique de rivière
      particle.position.x += Math.sin(Date.now() * 0.001 + index) * 0.01;
      particle.position.y += Math.cos(Date.now() * 0.0015 + index) * 0.005;
      
      // Rotation des particules crypto
      particle.rotation.x += 0.02;
      particle.rotation.y += 0.03;
      
      // Recycler les particules qui sortent du champ de vision
      if (particle.position.z > 25) {
        particle.position.z = -50;
        particle.position.x = (Math.random() - 0.5) * 10;
        particle.position.y = (Math.random() - 0.5) * 4;
      }
      
      // Effet de luminescence crypto qui se propage
      const distance = particle.position.distanceTo(camera.position);
      const intensity = Math.max(0, 1 - distance / 30);
      particle.material.emissiveIntensity = intensity * 0.5;
    });
  }

  function animateCryptoTokenRiver() {
    if (!animationId) return;
    
    animationId = requestAnimationFrame(animateCryptoTokenRiver);
    
    if (riverGroup) {
      updateCryptoRiverFlow();
      
      // Rotation globale de la rivière crypto
      riverGroup.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
  }

  return {
    start: () => {
      if (!animationId) {
        animationId = true;
        animateCryptoTokenRiver();
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
      if (riverGroup) {
        while (riverGroup.children.length > 0) {
          const child = riverGroup.children[0];
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
          riverGroup.remove(child);
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
      tokenParticles = [];
      riverGroup = null;
      scene = null;
      camera = null;
      renderer = null;
    }
  };
}
