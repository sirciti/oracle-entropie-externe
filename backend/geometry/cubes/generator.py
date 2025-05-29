import numpy as np
import random
from typing import List, Dict, Any

class CubeGenerator:
    """
    Générateur de système de cubes avec billes pour l'entropie géométrique.
    Crée des cubes avec des billes internes, avec positions et vitesses aléatoires.
    """
    def __init__(self):
        # Paramètres par défaut (peuvent être surchargés)
        self.max_velocity = 1.5  # Vitesse maximale initiale pour les billes

    def generate_cubes_system(self, num_cubes: int = 3, cube_size: float = 8.0, 
                            num_balls_per_cube: int = 3, space_bounds: float = 30.0) -> List[Dict[str, Any]]:
        """
        Génère un système de cubes dynamiques, chacun contenant des billes.

        Args:
            num_cubes: Nombre de cubes à générer.
            cube_size: Taille d'un côté du cube (en unités Three.js).
            num_balls_per_cube: Nombre de billes par cube.
            space_bounds: Taille du côté de la boîte de confinement des cubes.

        Returns:
            List[Dict]: Liste de dictionnaires représentant les cubes avec leurs propriétés et billes.
        """
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

            inner_cube_limit = (cube_size / 2.0) - (cube_size / 4.0)
            ball_radius = cube_size / 8.0

            for j in range(num_balls_per_cube):
                ball_pos = [
                    random.uniform(-inner_cube_limit, inner_cube_limit),
                    random.uniform(-inner_cube_limit, inner_cube_limit),
                    random.uniform(-inner_cube_limit, inner_cube_limit)
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
                    "color": [1.0, 1.0, 1.0],
                    "velocity": ball_vel
                })
            
            cubes.append(cube_data)

        return cubes

if __name__ == '__main__':
    generator = CubeGenerator()
    cubes_system = generator.generate_cubes_system(num_cubes=3, cube_size=8.0, num_balls_per_cube=3, space_bounds=30.0)
    print(f"Système de cubes généré : {len(cubes_system)} cubes")
    for i, cube in enumerate(cubes_system):
        print(f"\nCube {i+1}:")
        print(f"  Position: {cube['position']}")
        print(f"  Taille: {cube['size']}")
        print(f"  Vitesse: {cube['velocity']}")
        print(f"  Vitesse angulaire: {cube['angular_velocity']}")
        print(f"  {len(cube['balls'])} billes:")
        for j, ball in enumerate(cube['balls']):
            print(f"    Bille {j+1}: Position={ball['position']}, Vitesse={ball['velocity']}, Rayon={ball['radius']}")