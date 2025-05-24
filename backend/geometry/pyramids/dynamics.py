# backend/geometry/pyramids/dynamics.py

import numpy as np
from scipy.spatial.transform import Rotation
from typing import Dict, List, Tuple, Any

def update_pyramids_dynamics(
    system: Dict[str, Any],
    time_step: float = 0.1,
    chaos_factor: float = 0.05,
    noise_level: float = 0.1
) -> Dict[str, Any]:
    """
    Met à jour la dynamique du système de pyramides (rotation, déplacement des briques).
    Applique une rotation globale aux pyramides et des perturbations chaotiques (type Lorenz)
    et du bruit à chaque brique.

    Args:
        system (Dict): Système de pyramides généré par generate_pyramids_system().
        time_step (float): Pas de temps pour l'animation (contrôle la vitesse de l'évolution).
        chaos_factor (float): Intensité du chaos introduit dans les mouvements des briques (0 = stable, 1 = très chaotique).
        noise_level (float): Niveau de bruit aléatoire ajouté aux positions des briques.

    Returns:
        Dict: Système mis à jour avec les nouvelles positions et rotations des briques.
    """
    # Créer une copie du système pour ne pas modifier l'original en place
    updated_system = system.copy() 

    # Rotation globale des pyramides et dynamique chaotique pour chaque brique
    for pyramid in updated_system["pyramids"]:
        # 1. Rotation globale de la pyramide
        # Générer un axe de rotation aléatoire pour chaque pyramide pour une dynamique unique
        axis = np.random.randn(3)  
        # Normalisation de l'axe de rotation pour éviter les divisions par zéro
        axis /= np.linalg.norm(axis) if np.linalg.norm(axis) != 0 else 1.0 
        # L'angle de rotation est influencé par le pas de temps et le facteur de chaos
        angle = time_step * (1.0 + chaos_factor * np.random.rand()) 

        # Création de l'objet Rotation à partir de l'axe et de l'angle
        rot = Rotation.from_rotvec(angle * axis) 

        # Définir le centre de rotation de la pyramide (peut être son base_center ou un centre commun)
        rotation_center = np.array(pyramid["base_center"]) 

        # 2. Application de la dynamique chaotique et rotation à chaque brique
        for brick in pyramid["bricks"]:
            pos = np.array(brick["position"])

            # Appliquer la rotation globale de la pyramide autour de son centre
            rotated_pos = rot.apply(pos - rotation_center) + rotation_center

            # Appliquer une dynamique chaotique à la position de la brique (inspirée de Lorenz)
            x, y, z = rotated_pos 
            
            # Équations de Lorenz simplifiées (peuvent être ajustées pour différents comportements)
            # Les valeurs 10, 28, -8/3 sont des constantes classiques pour le système de Lorenz.
            # Le chaos_factor ajuste l'intensité de cette dynamique.
            dx = chaos_factor * (y - x)
            dy = chaos_factor * (x * (28 - z) - y)
            dz = chaos_factor * (x * y - (8/3) * z) # Correction pour une forme plus classique de Lorenz
            
            # Calcul des changements de position de la brique, incluant le bruit
            brick_dx = time_step * dx + noise_level * np.random.randn()
            brick_dy = time_step * dy + noise_level * np.random.randn()
            brick_dz = time_step * dz + noise_level * np.random.randn()
            
            # Mise à jour finale de la position de la brique
            brick["position"] = [
                x + brick_dx,
                y + brick_dy,
                z + brick_dz
            ]
            
            # Remarque: Les briques pourraient s'éloigner indéfiniment avec des systèmes chaotiques non contraints.
            # Pour la visualisation ou des contraintes physiques, il faudrait ajouter des "rebonds" ou des limites.

    return updated_system