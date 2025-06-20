import time
import random
import numpy as np
import logging
from typing import List, Dict, Any

# Les imports sont corrects si Docker est configuré avec PYTHONPATH=/usr/src/app
# et que les modules sont dans /usr/src/app/backend/geometry/cubes/
# Sinon, des imports absolus seraient nécessaires.
# Pour le test direct, la clause try-except est utile.
try:
    from .generator import CubeGenerator
except ImportError:
    # Ceci est pour les tests locaux directs, pas pour le fonctionnement normal dans Flask
    from backend.geometry.cubes.generator import CubeGenerator

logger = logging.getLogger(__name__)

def update_cubes_dynamics(
    cubes_system: List[Dict[str, Any]],
    delta_time: float = 0.1,
    gravity: float = -9.81 * 0.05,
    bounce_factor: float = 0.85,
    confinement_size: float = 30.0,
    chaos: float = 0.3 # Paramètre 'chaos' reçu de l'appelant
) -> List[Dict[str, Any]]:
    updated_cubes_system = []
    half_confinement = confinement_size / 2.0

    for cube in cubes_system:
        updated_cube = cube.copy()
        updated_cube["position"] = np.array(updated_cube["position"]) # Convertir en np.array pour calculs
        updated_cube["velocity"] = np.array(updated_cube["velocity"])
        updated_cube["angular_velocity"] = np.array(updated_cube["angular_velocity"])
        updated_cube["rotation"] = np.array(updated_cube["rotation"])
        updated_cube["balls"] = [ball.copy() for ball in updated_cube["balls"]] # Copie des billes

        # Assurez-vous que chaos_counter existe, l'initialiser si non
        if "chaos_counter" not in updated_cube:
            updated_cube["chaos_counter"] = random.uniform(0, 10)
        
        # Le chaos_factor doit utiliser le paramètre 'chaos' de la fonction.
        current_chaos_factor = chaos * (1 + np.sin(updated_cube["chaos_counter"]))
        updated_cube["chaos_counter"] += delta_time * 2

        # Mise à jour de la translation du cube
        rand_force = np.array([random.uniform(-1.0, 1.0) for _ in range(3)]) * delta_time * current_chaos_factor
        updated_cube["velocity"] += rand_force
        updated_cube["position"] += updated_cube["velocity"] * delta_time

        # Rebond sur les parois de la boîte de confinement pour le cube
        for i in range(3):
            if abs(updated_cube["position"][i]) + updated_cube["size"] / 2.0 > half_confinement:
                updated_cube["velocity"][i] *= -bounce_factor
                updated_cube["position"][i] = (
                    half_confinement - updated_cube["size"] / 2.0
                    if updated_cube["position"][i] > 0
                    else -half_confinement + updated_cube["size"] / 2.0
                )

        # Mise à jour de la rotation du cube
        updated_cube["rotation"] += updated_cube["angular_velocity"] * delta_time
        updated_cube["angular_velocity"] *= 0.995 # Frottement angulaire

        # Mise à jour des billes à l'intérieur du cube
        half_cube_size = updated_cube["size"] / 2.0
        for ball in updated_cube["balls"]:
            ball_pos = np.array(ball["position"])
            ball_vel = np.array(ball["velocity"])
            
            # Application de la gravité avec un facteur de chaos
            ball_vel[1] += gravity * delta_time * current_chaos_factor # Utilise current_chaos_factor
            ball_pos += ball_vel * delta_time

            # Rebond sur les parois internes du cube pour les billes
            inner_limit = half_cube_size - ball["radius"]
            for i in range(3):
                if abs(ball_pos[i]) > inner_limit:
                    ball_vel[i] *= -bounce_factor # Rebond
                    ball_pos[i] = inner_limit if ball_pos[i] > 0 else -inner_limit # Ajustement position
                    ball_vel[i] += random.uniform(-0.01, 0.01) # Petit bruit au rebond

            ball["position"] = ball_pos.tolist()
            ball["velocity"] = ball_vel.tolist()

        # Reconvertir les np.array en listes pour le retour JSON
        updated_cube["position"] = updated_cube["position"].tolist()
        updated_cube["velocity"] = updated_cube["velocity"].tolist()
        updated_cube["angular_velocity"] = updated_cube["angular_velocity"].tolist()
        updated_cube["rotation"] = updated_cube["rotation"].tolist()

        updated_cubes_system.append(updated_cube)

    return updated_cubes_system

def update_cubes_dynamics(cube):
    new_cube = {**cube}
    new_cube['position'] = [
        cube['position'][0] + np.random.normal(0, 0.5),
        cube['position'][1] + np.random.normal(0, 0.5),
        cube['position'][2] + np.random.normal(0, 0.5)
    ]
    new_cube['rotation'] = cube.get('rotation', [0, 0, 0])
    new_cube['size'] = cube.get('size', 8.0)
    return new_cube

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    from backend.geometry.cubes.generator import CubeGenerator # Import pour le test
    
    generator = CubeGenerator()
    initial_system = generator.generate_cubes_system(num_cubes=1, num_balls_per_cube=1, space_bounds=30.0, cube_size=8.0)
    
    print("Initial Cube Pos:", initial_system[0]["position"])
    print("Initial Ball Pos:", initial_system[0]["balls"][0]["position"])

    # Simuler plusieurs steps
    for step in range(100):
        initial_system = update_cubes_dynamics(initial_system, delta_time=0.05, chaos=0.5) # Passer chaos
        if step % 20 == 0:
            print(f"Step {step}: Cube Pos={initial_system[0]['position'][1]:.2f}, Ball Pos={initial_system[0]['balls'][0]['position'][1]:.2f}")