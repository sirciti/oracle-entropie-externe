import numpy as np
import secrets
import time
import random  # CORRECTION: Utiliser random au lieu de core.utils.utils
import logging

logger = logging.getLogger(__name__)

def get_entropy_data():
    """Fonction de remplacement pour générer de l'entropie."""
    return random.random()  # CORRECTION: Générer entropie simple

class CentrifugeLaserV2Generator:
    """Générateur révolutionnaire pour Centrifugeuse Laser 2.0 avec collisions physiques."""

    def __init__(self):
        self.system_random = secrets.SystemRandom()

        # CORRECTION: Utiliser float64 dès l'initialisation
        self.core_size_base = 0.4
        self.core_size_variation = 0.8
        self.arm_12h_position = np.array([0.0, 6.0, 0.0], dtype=np.float64)
        self.arm_6h_position = np.array([6.0, 0.0, 0.0], dtype=np.float64)
        self.arm_6h_velocity = np.array([0.0, 0.0, 0.0], dtype=np.float64)

        # Deuxième centrifugeuse oscillante
        self.satellite_centrifuge_position = np.array([6.0, 0.0, 0.0], dtype=np.float64)
        self.satellite_oscillation_phase = 0.0

        # État des collisions
        self.collision_active = False
        self.explosion_intensity = 0.0
        self.last_collision_time = 0.0

    def generate_centrifuge_v2_data(self) -> dict:
        """Génère les données pour la Centrifugeuse Laser 2.0."""
        try:
            entropy = get_entropy_data()
            current_time = time.time()

            # 1. NOYAU VARIABLE ALÉATOIRE
            core_size = self.core_size_base + (
                self.system_random.uniform(0, self.core_size_variation) *
                np.sin(current_time * 3 + entropy * 10)
            )

            # Couleur du noyau basée sur la taille
            core_hue = (core_size - self.core_size_base) / self.core_size_variation
            core_color = [
                0.5 + core_hue * 0.5,
                0.8 - core_hue * 0.3,
                1.0 - core_hue * 0.4
            ]

            # 2. MOUVEMENT ALÉATOIRE TIGE 6H - CORRECTION: Créer nouveaux tableaux
            random_force = np.array([
                self.system_random.uniform(-0.05, 0.05),
                self.system_random.uniform(-0.05, 0.05),
                self.system_random.uniform(-0.05, 0.05)
            ], dtype=np.float64)

            # CORRECTION: Remplacer += par = ... +
            self.arm_6h_velocity = self.arm_6h_velocity + random_force
            self.arm_6h_velocity = self.arm_6h_velocity * 0.98  # Amortissement
            self.arm_6h_position = self.arm_6h_position + self.arm_6h_velocity

            # Limites physiques
            max_distance = 8.0
            if np.linalg.norm(self.arm_6h_position) > max_distance:
                self.arm_6h_position = (self.arm_6h_position / np.linalg.norm(self.arm_6h_position)) * max_distance
                self.arm_6h_velocity = self.arm_6h_velocity * -0.7  # Rebond

            # 3. DÉTECTION COLLISION ENTRE TIGES
            distance_between_arms = np.linalg.norm(self.arm_12h_position - self.arm_6h_position)
            collision_threshold = 2.0

            if distance_between_arms < collision_threshold and not self.collision_active:
                # COLLISION DÉTECTÉE !
                self.collision_active = True
                self.explosion_intensity = 1.0
                self.last_collision_time = current_time

                # Rebond physique réaliste
                collision_vector = self.arm_6h_position - self.arm_12h_position
                collision_vector = collision_vector / np.linalg.norm(collision_vector)

                # Conservation d'énergie et rebond
                impact_force = np.dot(self.arm_6h_velocity, collision_vector)
                self.arm_6h_velocity = self.arm_6h_velocity - 2 * impact_force * collision_vector
                self.arm_6h_velocity = self.arm_6h_velocity * 1.2  # Amplification du rebond

                logger.info(f"COLLISION ATOMIQUE détectée ! Intensité: {self.explosion_intensity}")

            # Décroissance de l'explosion
            if self.collision_active:
                time_since_collision = current_time - self.last_collision_time
                self.explosion_intensity = max(0.0, 1.0 - time_since_collision * 2)
                if self.explosion_intensity <= 0:
                    self.collision_active = False

            # 4. DEUXIÈME CENTRIFUGEUSE OSCILLANTE
            self.satellite_oscillation_phase += 0.1 + entropy * 0.05
            satellite_offset = np.array([
                np.sin(self.satellite_oscillation_phase) * 2,
                np.cos(self.satellite_oscillation_phase * 1.3) * 1.5,
                np.sin(self.satellite_oscillation_phase * 0.7) * 1
            ], dtype=np.float64)
            self.satellite_centrifuge_position = self.arm_6h_position + satellite_offset

            # 5. GÉNÉRATION DES SPHÈRES ET CUBES AVEC ENTROPIE MAXIMALE
            spheres = []
            cubes = []

            # Sphères autour de la tige 12H (affectées par les collisions)
            sphere_count = 8
            for i in range(sphere_count):
                angle = (i / sphere_count) * 2 * np.pi + current_time * 0.5
                radius = 3 + np.sin(current_time * 2 + i) * 0.5

                # Perturbation lors des explosions
                if self.collision_active:
                    radius += self.explosion_intensity * self.system_random.uniform(0, 2)
                    angle += self.explosion_intensity * self.system_random.uniform(-0.5, 0.5)

                sphere_pos = [
                    float(np.cos(angle) * radius),
                    float(8 + np.sin(angle * 2) * 2),
                    float(np.sin(angle) * radius)
                ]

                # Couleur influencée par l'explosion
                explosion_factor = self.explosion_intensity if self.collision_active else 0
                sphere_color = [
                    0.3 + explosion_factor * 0.7,
                    0.5 - explosion_factor * 0.3,
                    0.8 - explosion_factor * 0.6
                ]

                spheres.append({
                    "position": sphere_pos,
                    "color": sphere_color,
                    "radius": 0.4 + explosion_factor * 0.3
                })

            # Cubes autour de la tige 6H mobile
            cube_count = 6
            for i in range(cube_count):
                angle = (i / cube_count) * 2 * np.pi + current_time * 0.3
                radius = 4

                cube_pos = [
                    self.arm_6h_position[0] + np.cos(angle) * radius,
                    self.arm_6h_position[1] + np.sin(angle) * radius,
                    self.arm_6h_position[2] + np.cos(angle * 1.5) * radius * 0.5
                ]

                cube_color = [
                    0.8 - i * 0.1,
                    0.4 + i * 0.1,
                    0.6 + np.sin(current_time + i) * 0.2
                ]

                cubes.append({
                    "position": cube_pos,
                    "color": cube_color,
                    "size": 0.6
                })

            return {
                "type": "centrifuge_laser_v2",
                "core": {
                    "size": core_size,
                    "color": core_color,
                    "pulsation": np.sin(current_time * 5) * 0.5 + 0.5
                },
                "arms": {
                    "arm_12h": {
                        "position": self.arm_12h_position.tolist(),
                        "rotation": current_time * 0.5
                    },
                    "arm_6h": {
                        "position": self.arm_6h_position.tolist(),
                        "velocity": self.arm_6h_velocity.tolist(),
                        "rotation": current_time * 0.3
                    }
                },
                "satellite_centrifuge": {
                    "position": self.satellite_centrifuge_position.tolist(),
                    "oscillation_phase": self.satellite_oscillation_phase,
                    "active": True
                },
                "collision": {
                    "active": self.collision_active,
                    "intensity": self.explosion_intensity,
                    "distance_between_arms": distance_between_arms
                },
                "spheres": spheres,
                "cubes": cubes,
                "entropy_quality": entropy,
                "timestamp": current_time
            }

        except Exception as e:
            logger.error(f"Erreur génération Centrifugeuse Laser V2: {e}")
            return {"error": str(e)}

def generate_centrifuge_laser_v2_data() -> dict:
    """Interface principale pour génération Centrifugeuse Laser 2.0."""
    generator = CentrifugeLaserV2Generator()
    return generator.generate_centrifuge_v2_data()
