import numpy as np
import random
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class CubeGenerator:
    """
    Générateur de système de cubes avec billes pour l'entropie géométrique.
    Crée des cubes avec des billes internes, avec positions et vitesses aléatoires.
    """
    def __init__(self):
        self.max_velocity = 1.5

    def generate_cubes_system(self, num_cubes: int = 3, cube_size: float = 8.0,
                              num_balls_per_cube: int = 3, space_bounds: float = 30.0) -> List[Dict[str, Any]]:
        cubes = []
        cube_spawn_limit = space_bounds / 2 - cube_size / 2

        for i in range(num_cubes):
            pos = [
                random.uniform(-cube_spawn_limit, cube_spawn_limit),
                random.uniform(-cube_spawn_limit, cube_spawn_limit),
                random.uniform(-cube_spawn_limit, cube_spawn_limit)
            ]
            vel = [
                random.uniform(-0.5, 0.5),
                random.uniform(-0.5, 0.5),
                random.uniform(-0.5, 0.5)
            ]
            ang_vel = [
                random.uniform(-0.02, 0.02),
                random.uniform(-0.02, 0.02),
                random.uniform(-0.02, 0.02)
            ]

            cube_data = {
                "id": i,
                "position": pos,
                "size": cube_size,
                "velocity": vel,
                "angular_velocity": ang_vel,
                "rotation": [0.0, 0.0, 0.0],
                "balls": []
            }

            half_cube_limit = (cube_size / 2.0) - (cube_size / 8.0)
            ball_radius = cube_size / 8.0

            for j in range(num_balls_per_cube):
                ball_pos = [
                    random.uniform(-half_cube_limit, half_cube_limit),
                    random.uniform(-half_cube_limit, half_cube_limit),
                    random.uniform(-half_cube_limit, half_cube_limit)
                ]
                ball_vel = [
                    random.uniform(-self.max_velocity, self.max_velocity),
                    random.uniform(-self.max_velocity, self.max_velocity),
                    random.uniform(-self.max_velocity, self.max_velocity)
                ]
                cube_data["balls"].append({
                    "id": j,
                    "position": ball_pos,
                    "radius": ball_radius,
                    "color": [1.0, 0.0, 0.0],
                    "velocity": ball_vel
                })

            cubes.append(cube_data)

        logger.info(f"Génération du système de {num_cubes} cubes avec {num_balls_per_cube} billes/cube terminée.")
        return cubes

# --- ALIAS POUR COMPATIBILITÉ AVEC LE RESTE DU PROJET ---
def generate_cubes_data(*args, **kwargs):
    return CubeGenerator().generate_cubes_system(*args, **kwargs)
