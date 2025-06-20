import * as THREE from "three";

export function initCubesVisualizer(containerId) {
  const visualizer = new CubesVisualizer(containerId);

  return {
    start: () => visualizer.start(),
    stop: () => visualizer.stop(),
    isRunning: () => visualizer.isRunning(),
    resize: () => visualizer.onWindowResize()
  };
}

export default class CubesVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Conteneur ${containerId} introuvable`);
            return;
        }

        // Initialisation Three.js
        this.initThreeJS();

        // Variables d'animation
        this.cubes = [];
        this.balls = [];
        this.animationFrameId = null;
        this.isAnimating = false;

        // NOUVEAU : Variables pour la luminescence
        this.luminescenceIndex = 0;
        this.luminescenceSpeed = 0.1;

        // Chargement des données
        this.loadData();
    }

    start() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }

    stop() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    isRunning() {
        return this.isAnimating;
    }

    initThreeJS() {
        // Scène
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x181818);

        // Caméra
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 50;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Lumière
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        this.scene.add(directionalLight);

        // Groupe global pour la rotation
        this.globalGroup = new THREE.Group();
        this.scene.add(this.globalGroup);
    }

    async loadData() {
        try {
            const response = await fetch('/api/geometry/cubes/initial');
            const data = await response.json();

            if (data.cubes && data.cubes.length > 0) {
                this.createCubes(data.cubes);
            }
        } catch (error) {
            console.error("Erreur de chargement:", error);
        }
    }

    createCubes(cubesData) {
        cubesData.forEach((cubeData, index) => {
            const cubeGroup = new THREE.Group();
            cubeGroup.position.set(
                cubeData.position[0] * 0.3,
                cubeData.position[1] * 0.3,
                cubeData.position[2] * 0.3
            );

            const cubeGeometry = new THREE.BoxGeometry(cubeData.size, cubeData.size, cubeData.size);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true
            });
            const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cubeGroup.add(cubeMesh);

            const ballGroup = new THREE.Group();

            cubeData.balls.forEach((ball, ballIndex) => {
                const ballRadius = cubeData.size / 8;
                const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
                const ballMaterial = new THREE.MeshPhongMaterial({
                    color: 0xff0000,
                    emissive: 0x000000,
                    emissiveIntensity: 0
                });
                const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

                ballMesh.position.set(
                    (Math.random() - 0.5) * cubeData.size * 0.8,
                    (Math.random() - 0.5) * cubeData.size * 0.8,
                    (Math.random() - 0.5) * cubeData.size * 0.8
                );

                ballMesh.userData = {
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                    ),
                    ballIndex: ballIndex,
                    cubeIndex: index,
                    originalColor: 0xff0000,
                    isLuminous: false
                };

                ballGroup.add(ballMesh);
                this.balls.push(ballMesh);
            });

            cubeGroup.add(ballGroup);
            this.globalGroup.add(cubeGroup);
            this.cubes.push({
                group: cubeGroup,
                ballGroup: ballGroup,
                size: cubeData.size,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                ),
                rotationVelocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                )
            });
        });
    }

    checkCubeCollisions() {
        for (let i = 0; i < this.cubes.length; i++) {
            for (let j = i + 1; j < this.cubes.length; j++) {
                const cube1 = this.cubes[i];
                const cube2 = this.cubes[j];
                
                // Calculer la distance entre les centres des cubes
                const distance = cube1.group.position.distanceTo(cube2.group.position);
                const minDistance = (cube1.size + cube2.size) / 2; // Somme des demi-tailles
                
                // Détecter la collision par distance
                if (distance < minDistance) {
                    // Calculer la direction de séparation
                    const direction = new THREE.Vector3()
                        .subVectors(cube2.group.position, cube1.group.position)
                        .normalize();
                    
                    // Si les cubes sont exactement au même endroit, créer une direction aléatoire
                    if (direction.length() === 0) {
                        direction.set(
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2,
                            (Math.random() - 0.5) * 2
                        ).normalize();
                    }
                    
                    // Séparer immédiatement les cubes
                    const overlap = minDistance - distance;
                    const separation = direction.clone().multiplyScalar(overlap / 2 + 0.1);
                    
                    cube1.group.position.sub(separation);
                    cube2.group.position.add(separation);
                    
                    // Échanger et inverser les vitesses avec amortissement
                    const tempVel = cube1.velocity.clone();
                    cube1.velocity.copy(cube2.velocity).multiplyScalar(0.9);
                    cube2.velocity.copy(tempVel).multiplyScalar(0.9);
                    
                    // Ajouter une composante de rebond dans la direction de séparation
                    const bounceForce = 0.1;
                    cube1.velocity.add(direction.clone().multiplyScalar(-bounceForce));
                    cube2.velocity.add(direction.clone().multiplyScalar(bounceForce));
                }
            }
        }
    }

    animate() {
        if (!this.isAnimating) return;

        this.globalGroup.rotation.y += 0.001;
        this.globalGroup.rotation.x += 0.0005;

        this.cubes.forEach(cube => {
            cube.group.position.add(cube.velocity);
            cube.group.rotation.x += cube.rotationVelocity.x;
            cube.group.rotation.y += cube.rotationVelocity.y;
            cube.group.rotation.z += cube.rotationVelocity.z;

            if (Math.abs(cube.group.position.x) > 15) cube.velocity.x *= -1;
            if (Math.abs(cube.group.position.y) > 10) cube.velocity.y *= -1;
            if (Math.abs(cube.group.position.z) > 10) cube.velocity.z *= -1;

            cube.ballGroup.children.forEach(ball => {
                ball.position.add(ball.userData.velocity);

                const halfSize = cube.size / 2;
                if (Math.abs(ball.position.x) > halfSize) {
                    ball.position.x = Math.sign(ball.position.x) * halfSize * 0.9;
                    ball.userData.velocity.x *= -1;
                }
                if (Math.abs(ball.position.y) > halfSize) {
                    ball.position.y = Math.sign(ball.position.y) * halfSize * 0.9;
                    ball.userData.velocity.y *= -1;
                }
                if (Math.abs(ball.position.z) > halfSize) {
                    ball.position.z = Math.sign(ball.position.z) * halfSize * 0.9;
                    ball.userData.velocity.z *= -1;
                }
            });
        });

        this.checkCubeCollisions();

        // NOUVEAU : Gestion de la luminescence séquentielle
        this.updateLuminescence();

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    // NOUVELLE méthode : Gestion de la luminescence
    updateLuminescence() {
        this.balls.forEach(ball => {
            ball.material.emissive.setHex(0x000000);
            ball.material.emissiveIntensity = 0;
            ball.userData.isLuminous = false;
        });

        const totalBalls = this.balls.length;
        if (totalBalls === 0) return;

        this.luminescenceIndex += this.luminescenceSpeed;
        const currentBallIndex = Math.floor(this.luminescenceIndex) % totalBalls;

        const currentBall = this.balls[currentBallIndex];
        if (currentBall) {
            const velocity = currentBall.userData.velocity;
            const speed = velocity.length();
            const hue = (speed * 100) % 1;
            const luminousColor = new THREE.Color().setHSL(hue, 1, 0.5);

            currentBall.material.emissive.copy(luminousColor);
            currentBall.material.emissiveIntensity = 0.8;
            currentBall.userData.isLuminous = true;

            this.generateEntropyFromLuminousBall(currentBall);
        }
    }

    // NOUVELLE méthode : Génération d'entropie
    generateEntropyFromLuminousBall(ball) {
        const pos = ball.position;
        const vel = ball.userData.velocity;

        const entropyValue = (
            Math.abs(pos.x * vel.x) +
            Math.abs(pos.y * vel.y) +
            Math.abs(pos.z * vel.z)
        ) % 1;

        // console.log(`Entropie générée par bille lumineuse: ${entropyValue}`);
        // Ici tu peux envoyer cette valeur au backend si nécessaire
        return entropyValue;
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
