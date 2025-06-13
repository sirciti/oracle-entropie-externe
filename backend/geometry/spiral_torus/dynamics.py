# backend/geometry/spiral_torus/dynamics.py

import numpy as np
from scipy.spatial.transform import Rotation
from typing import Dict, Any

def update_toroidal_spiral_dynamics(
    system: Dict[str, Any],
    delta_time: float = 0.1,
    chaos_factor: float = 0.05,
    noise_level: float = 0.1
) -> Dict[str, Any]:
    """
    Met à jour la dynamique du système de spirale toroïdale (rotation, déplacement des billes/cubes).

    Args:
        system (Dict): Système généré par generate_toroidal_spiral_system().
        delta_time (float): Pas de temps pour l'animation.
        chaos_factor (float): Intensité du chaos dans les mouvements.
        noise_level (float): Niveau de bruit aléatoire ajouté aux positions.

    Returns:
        Dict: Système mis à jour avec les nouvelles positions des billes/cubes.
    """
    updated_system = system.copy()

    # Rotation globale et dynamique chaotique pour les points
    points = updated_system["spiral"]["points"]
    axis = np.random.randn(3)
    axis /= np.linalg.norm(axis) if np.linalg.norm(axis) != 0 else 1.0
    angle = delta_time * (1.0 + chaos_factor * np.random.rand())
    rot = Rotation.from_rotvec(angle * axis)
    rotation_center = np.array([0.0, 0.0, 0.0])  # Centre de la spirale

    for point in points:
        pos = np.array(point["position"])
        # Appliquer la rotation globale
        rotated_pos = rot.apply(pos - rotation_center) + rotation_center
        x, y, z = rotated_pos

        # Appliquer une dynamique chaotique (Lorenz simplifié)
        dx = chaos_factor * (y - x)
        dy = chaos_factor * (x * (28 - z) - y)
        dz = chaos_factor * (x * y - (8/3) * z)

        # Calculer les déplacements avec bruit
        point_dx = delta_time * dx + noise_level * np.random.randn()
        point_dy = delta_time * dy + noise_level * np.random.randn()
        point_dz = delta_time * dz + noise_level * np.random.randn()

        # Mettre à jour la position
        point["position"] = [
            float(x + point_dx),
            float(y + point_dy),
            float(z + point_dz)
        ]

    return updated_system