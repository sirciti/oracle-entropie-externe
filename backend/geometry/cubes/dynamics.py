import numpy as np
import random
from typing import List, Dict, Any


def update_cubes_dynamics(
    cubes_system: List[Dict[str, Any]],
    delta_time: float,
    gravity: float = -9.81 * 0.05,
    bounce_factor: float = 0.85,
    confinement_size: float = 30.0
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

        # 1. Translation du cube avec bruit
        for i in range(3):
            updated_cube["velocity"][i] += random.uniform(-0.8, 0.8) * delta_time
            updated_cube["angular_velocity"][i] += random.uniform(-0.08, 0.08) * delta_time
            updated_cube["velocity"][i] += random.uniform(-0.2, 0.2) * delta_time
            updated_cube["position"][i] += updated_cube["velocity"][i] * delta_time
            if abs(updated_cube["position"][i]) + updated_cube["size"] / 2.0 > half_confinement:
                updated_cube["velocity"][i] *= -bounce_factor
                if updated_cube["position"][i] > 0:
                    updated_cube["position"][i] = half_confinement - updated_cube["size"] / 2.0
                else:
                    updated_cube["position"][i] = -half_confinement + updated_cube["size"] / 2.0

        # 2. Rotation du cube
        updated_cube["rotation"][0] += updated_cube["angular_velocity"][0] * delta_time
        updated_cube["rotation"][1] += updated_cube["angular_velocity"][1] * delta_time
        updated_cube["rotation"][2] += updated_cube["angular_velocity"][2] * delta_time
        updated_cube["angular_velocity"] = [v * 0.995 for v in updated_cube["angular_velocity"]]

        # 3. Dynamique des billes
        half_cube_size = updated_cube["size"] / 2.0
        for ball in updated_cube["balls"]:
            ball_pos = np.array(ball["position"])
            ball_vel = np.array(ball["velocity"])
            ball_vel[1] += gravity * delta_time
            ball_pos += ball_vel * delta_time

            inner_limit = half_cube_size - ball["radius"]
            for i in range(3):
                if abs(ball_pos[i]) > inner_limit:
                    ball_vel[i] *= -bounce_factor
                    ball_pos[i] = inner_limit if ball_pos[i] > 0 else -inner_limit
                    ball["velocity"][i] += random.uniform(-0.01, 0.01)

            ball["position"] = ball_pos.tolist()
            ball["velocity"] = ball_vel.tolist()

        updated_cubes_system.append(updated_cube)

    # Gestion simple des collisions entre cubes
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


if __name__ == '__main__':
    # Test unitaire simple pour la dynamique
    try:
        generator = CubeGenerator()
    except Exception:
        from backend.geometry.cubes.generator import CubeGenerator
        generator = CubeGenerator()

    initial_system = generator.generate_cubes_system()
    print("Initial Cube Pos:", initial_system[0]["position"])
    print("Initial Ball Pos:", initial_system[0]["balls"][0]["position"])

    for step in range(100):
        initial_system = update_cubes_dynamics(initial_system, delta_time=0.05)
        if step % 20 == 0:
            print(f"Step {step}: Cube Pos={initial_system[0]['position'][1]:.2f}, Ball Pos={initial_system[0]['balls'][0]['position'][1]:.2f}")
