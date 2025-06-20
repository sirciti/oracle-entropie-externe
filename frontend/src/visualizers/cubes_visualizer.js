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

        this.isAnimating = false;

        // Initialisation Three.js
        this.initThreeJS();

        // Variables d'animation
        this.cubes = [];
        this.balls = [];
        this.animationFrameId = null;

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
        // Création des cubes
        cubesData.forEach((cubeData, index) => {
            // Groupe pour le cube et ses billes
            const cubeGroup = new THREE.Group();
            
            // Position initiale plus dispersée
            cubeGroup.position.set(
                cubeData.position[0] * 0.3,
                cubeData.position[1] * 0.3,
                cubeData.position[2] * 0.3
            );

            // Cube (filaire blanc)
            const cubeGeometry = new THREE.BoxGeometry(cubeData.size, cubeData.size, cubeData.size);
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: true
            });
            const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cubeGroup.add(cubeMesh);

            // Billes rouges
            const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            const ballGroup = new THREE.Group();

            cubeData.balls.forEach(ball => {
                const ballRadius = cubeData.size / 8;
                const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
                const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

                // Position initiale aléatoire à l'intérieur du cube
                ballMesh.position.set(
                    (Math.random() - 0.5) * cubeData.size * 0.8,
                    (Math.random() - 0.5) * cubeData.size * 0.8,
                    (Math.random() - 0.5) * cubeData.size * 0.8
                );

                // Vitesse aléatoire
                ballMesh.userData = {
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5
                    )
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
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                rotationVelocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                )
            });
        });
    }

    checkCubeCollisions() {
        for (let i = 0; i < this.cubes.length; i++) {
            for (let j = i + 1; j < this.cubes.length; j++) {
                const cube1 = this.cubes[i];
                const cube2 = this.cubes[j];
                
                // Créer les bounding boxes
                const box1 = new THREE.Box3().setFromObject(cube1.group);
                const box2 = new THREE.Box3().setFromObject(cube2.group);
                
                // Détecter la collision
                if (box1.intersectsBox(box2)) {
                    // Calculer la direction de séparation
                    const direction = new THREE.Vector3()
                        .subVectors(cube2.group.position, cube1.group.position)
                        .normalize();
                    
                    // Inverser et modifier les vitesses
                    const tempVel = cube1.velocity.clone();
                    cube1.velocity.copy(cube2.velocity).multiplyScalar(0.8);
                    cube2.velocity.copy(tempVel).multiplyScalar(0.8);
                    
                    // Séparer légèrement les cubes pour éviter le collage
                    cube1.group.position.add(direction.clone().multiplyScalar(-0.5));
                    cube2.group.position.add(direction.clone().multiplyScalar(0.5));
                }
            }
        }
    }

    animate() {
        if (!this.isAnimating) return;

        // Rotation globale lente
        this.globalGroup.rotation.y += 0.001;
        this.globalGroup.rotation.x += 0.0005;

        // Animation des cubes et billes
        this.cubes.forEach(cube => {
            // Mouvement du cube
            cube.group.position.add(cube.velocity);
            cube.group.rotation.x += cube.rotationVelocity.x;
            cube.group.rotation.y += cube.rotationVelocity.y;
            cube.group.rotation.z += cube.rotationVelocity.z;

            // Rebond des cubes aux limites (limites réduites)
            if (Math.abs(cube.group.position.x) > 15) cube.velocity.x *= -1;
            if (Math.abs(cube.group.position.y) > 10) cube.velocity.y *= -1;
            if (Math.abs(cube.group.position.z) > 10) cube.velocity.z *= -1;

            // Animation des billes
            cube.ballGroup.children.forEach(ball => {
                // Mise à jour position
                ball.position.add(ball.userData.velocity);

                // Rebond à l'intérieur du cube
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

        // Appel de la détection/correction des collisions entre cubes
        this.checkCubeCollisions();

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
