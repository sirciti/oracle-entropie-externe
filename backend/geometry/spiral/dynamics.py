import numpy as np
from typing import List, Dict, Any
import logging
import time

logger = logging.getLogger("spiral_dynamics")

def update_spiral_dynamics(
    spiral_data: Dict[str, Any],
    delta_time: float = 0.01,
    rotation_speed: float = 0.1,
    oscillation_amplitude: float = 0.05
) -> Dict[str, Any]:
    """Met à jour les positions de la spirale avec une dynamique (rotation/oscillation)."""
    try:
        positions = np.array(spiral_data.get("positions", []))
        if len(positions) == 0:
            logger.error("Aucune position fournie pour la dynamique de la spirale")
            return spiral_data

        # Appliquer une rotation autour de l'axe Z
        theta = rotation_speed * delta_time
        rotation_matrix = np.array([
            [np.cos(theta), -np.sin(theta), 0],
            [np.sin(theta), np.cos(theta), 0],
            [0, 0, 1]
        ])
        positions = np.dot(positions, rotation_matrix.T)

        # Ajouter une oscillation sur le rayon
        time_factor = np.sin(time.time())
        positions[:, 0] += oscillation_amplitude * time_factor * positions[:, 0]
        positions[:, 1] += oscillation_amplitude * time_factor * positions[:, 1]

        spiral_data["positions"] = positions.tolist()
        return spiral_data
    except Exception as e:
        logger.error(f"Erreur dans update_spiral_dynamics : {e}")
        return spiral_data

# Alias pour compatibilité API
animate_spiral_simple = update_spiral_dynamics