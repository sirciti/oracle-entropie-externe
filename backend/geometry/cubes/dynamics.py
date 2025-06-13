import time
import random
import numpy as np
import logging
from typing import List, Dict, Any

try:
    from .generator import CubeGenerator
except ImportError:
    from backend.geometry.cubes.generator import CubeGenerator

logger = logging.getLogger(__name__)

def update_cubes_dynamics(
    cubes_system: List[Dict[str, Any]],
    delta_time: float = 0.03,
    gravity: float = -9.81 * 0.05,
    bounce_factor: float = 0.85,
    confinement_size: float = 30.0,
    chaos: float = 0.7
) -> List[Dict[str, Any]]:
    updated_cubes_system = []
    half_confinement = confinement_size / 2.0

    for cube in cubes_system:
        updated_cube = cube.copy()
        updated_cube["position"] = updated_cube["position"].copy()
        updated_cube["velocity"] = updated_cube["velocity"].copy()
        updated_cube["angular_velocity"] = updated_cube["angular_velocity"].copy()
        updated_cube["rotation"] = updated_cube["rotation"].copy()
        updated_cube["balls"] = [ball.copy() for ball in updated_cube["balls"]]
        for ball in updated_cube["balls"]:
            ball["position"] = ball["position"].copy()
            ball["velocity"] = ball["velocity"].copy()

        # Ajouter un compteur de chaos persistant
        if "chaos_counter" not in updated_cube:
            updated_cube["chaos_counter"] = random.uniform(0, 10)

        chaos_factor = chaos * (1 + np.sin(updated_cube["chaos_counter"]))  # Variation unique
        updated_cube["chaos_counter"] += delta_time * 2  # Évolution du chaos

        for i in range(3):
            # Forces chaotiques
            rand_force = random.uniform(-2.0, 2.0) * delta_time * chaos_factor
            periodic_force = 1.0 * np.sin(time.time() * 3 + i + updated_cube["chaos_counter"]) * delta_time
            updated_cube["velocity"][i] += rand_force + periodic_force
            updated_cube["angular_velocity"][i] += random.uniform(-0.3, 0.3) * updated_cube["position"][i] * delta_time
            updated_cube["position"][i] += updated_cube["velocity"][i] * delta_time

            # Collisions avec les parois
            if abs(updated_cube["position"][i]) + updated_cube["size"] / 2.0 > half_confinement:
                updated_cube["velocity"][i] *= -random.uniform(0.6, 0.9)
                updated_cube["position"][i] = (
                    half_confinement - updated_cube["size"] / 2.0
                    if updated_cube["position"][i] > 0
                    else -half_confinement + updated_cube["size"] / 2.0
                )

        # Mise à jour des rotations avec chaos
        updated_cube["rotation"] = [
            r + w * delta_time + random.uniform(-0.1, 0.1) * chaos_factor
            for r, w in zip(updated_cube["rotation"], updated_cube["angular_velocity"])
        ]

        # Dynamique des billes
        half_cube_size = updated_cube["size"] / 2.0
        for ball in updated_cube["balls"]:
            ball_pos = np.array(ball["position"])
            ball_vel = np.array(ball["velocity"])
            ball_vel[1] += gravity * delta_time * chaos_factor
            ball_pos += ball_vel * delta_time

            inner_limit = half_cube_size - ball["radius"]
            for i in range(3):
                if abs(ball_pos[i]) > inner_limit:
                    ball_vel[i] *= -random.uniform(0.6, 0.9)
                    ball_pos[i] = inner_limit if ball_pos[i] > 0 else -inner_limit
                    ball_vel[i] += random.uniform(-0.3, 0.3) * chaos_factor

            ball["position"] = ball_pos.tolist()
            ball["velocity"] = ball_vel.tolist()

        updated_cubes_system.append(updated_cube)

    # Collisions entre cubes
    for i, cube1 in enumerate(updated_cubes_system):
        for cube2 in updated_cubes_system[i + 1:]:
            pos1 = np.array(cube1["position"])
            pos2 = np.array(cube2["position"])
            size = cube1["size"]
            if np.all(np.abs(pos1 - pos2) < size):
                vel1 = np.array(cube1["velocity"])
                vel2 = np.array(cube2["velocity"])
                cube1["velocity"] = (vel2 * 0.9 + vel1 * 0.1).tolist()
                cube2["velocity"] = (vel1 * 0.9 + vel2 * 0.1).tolist()

    return updated_cubes_system

def update_cubes_dynamics(cubes, delta_time=0.016, chaos_factor=0.05):
    try:
        for cube in cubes:
            cube['position'] = [p + np.random.uniform(-chaos_factor, chaos_factor) * delta_time for p in cube['position']]
            for ball in cube.get('balls', []):
                ball['position'] = [p + np.random.uniform(-chaos_factor, chaos_factor) * delta_time for p in ball['position']]
        return cubes
    except Exception as e:
        logger.error(f"Erreur dans update_cubes_dynamics : {e}")
        raise
