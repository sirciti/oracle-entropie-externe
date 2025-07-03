import numpy as np
from typing import Dict, List, Any

def generate_toroidal_spiral_system(
    R: float = 8.0,
    r: float = 2.0,
    n_turns: int = 3,
    n_points: int = 24,
    seed: int = None
) -> Dict[str, Any]:
    """
    Génère un système de spirale toroïdale avec des billes et cubes placés sur les points.
    Génère la spirale toroïdale (remplace l’ancienne logique pyramids).

    Args:
        R (float): Rayon du tore.
        r (float): Rayon du tube.
        n_turns (int): Nombre de tours de la spirale.
        n_points (int): Nombre de points à générer.
        seed (int): Graine pour la reproductibilité (optionnel).

    Returns:
        Dict: Dictionnaire avec les données géométriques des billes/cubes et métadonnées.
              Format: {"spiral": {"points": [point_data,...]}, "metadata": {...}}
              Chaque point_data contient "position", "type" ("sphere" ou "cube"), "size", "color".
    """
    if seed is not None:
        np.random.seed(seed)

    system = {
        "spiral": {"points": []},
        "metadata": {
            "R": R,
            "r": r,
            "n_turns": n_turns,
            "n_points": n_points,
            "seed": seed
        }
    }

    # Générer les points de la spirale toroïdale
    t = np.linspace(0, 2 * np.pi * n_turns, n_points)
    theta = t
    phi = t
    x = (R + r * np.cos(phi)) * np.cos(theta)
    y = (R + r * np.cos(phi)) * np.sin(theta)
    z = r * np.sin(phi)

    # Placer billes (tous les points) et cubes (un point sur deux)
    for i, (xi, yi, zi) in enumerate(zip(x, y, z)):
        # Bille à chaque point
        system["spiral"]["points"].append({
            "position": [xi, yi, zi],
            "type": "sphere",
            "size": r * 0.5,  # Taille de la bille
            "color": np.random.rand(3).tolist()  # Couleur aléatoire
        })
        
        # Cube à un point sur deux
        if i % 2 == 0:
            system["spiral"]["points"].append({
                "position": [xi, yi, zi],
                "type": "cube",
                "size": r * 0.5,  # Taille du cube
                "color": np.random.rand(3).tolist()  # Couleur aléatoire
            })

    return system


def generate_spiral_torus_data(*args, **kwargs):
    # Appelle la vraie fonction ou lève une exception si non implémenté
    raise NotImplementedError("Spiral torus non implémenté")
