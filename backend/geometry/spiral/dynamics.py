import numpy as np
from typing import List, Dict, Any
import logging
import time

logger = logging.getLogger("spiral_dynamics")

def update_spiral_dynamics(
    spiral_data: Dict[str, Any],
    delta_time: float = 0.01,
    rotation_speed: float = 0.2,  # Augmenté pour plus de fluidité
    oscillation_amplitude: float = 0.1,  # Augmenté pour plus de mouvement
    vertical_wave_speed: float = 0.05,  # NOUVEAU : mouvement vertical
    twist_factor: float = 0.02  # NOUVEAU : torsion de la spirale
) -> Dict[str, Any]:
    """Met à jour les positions de la spirale avec une dynamique améliorée."""
    try:
        positions = np.array(spiral_data.get("positions", []))
        if len(positions) == 0:
            logger.error("Aucune position fournie pour la dynamique de la spirale")
            return spiral_data

        # 1. Rotation autour de l'axe Z (améliorée)
        theta = rotation_speed * delta_time
        rotation_matrix = np.array([
            [np.cos(theta), -np.sin(theta), 0],
            [np.sin(theta), np.cos(theta), 0],
            [0, 0, 1]
        ])
        positions = np.dot(positions, rotation_matrix.T)

        # 2. Oscillation radiale (améliorée)
        time_factor = np.sin(time.time() * 2)  # Plus rapide
        positions[:, 0] += oscillation_amplitude * time_factor * positions[:, 0]
        positions[:, 1] += oscillation_amplitude * time_factor * positions[:, 1]

        # 3. NOUVEAU : Mouvement vertical ondulatoire
        wave_time = time.time() * vertical_wave_speed
        for i, pos in enumerate(positions):
            wave_offset = np.sin(wave_time + i * 0.1) * 0.3
            positions[i, 2] += wave_offset

        # 4. NOUVEAU : Torsion progressive de la spirale
        twist_time = time.time() * twist_factor
        for i, pos in enumerate(positions):
            twist_angle = twist_time + i * 0.05
            x, y = pos[0], pos[1]
            positions[i, 0] = x * np.cos(twist_angle) - y * np.sin(twist_angle)
            positions[i, 1] = x * np.sin(twist_angle) + y * np.cos(twist_angle)

        spiral_data["positions"] = positions.tolist()
        return spiral_data
    except Exception as e:
        logger.error(f"Erreur dans update_spiral_dynamics : {e}")
        return spiral_data

# Alias pour compatibilité API
animate_spiral_simple = update_spiral_dynamics