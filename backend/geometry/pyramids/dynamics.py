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

    Args:
        system (Dict): Système de pyramides généré par generate_pyramids_system().
        time_step (float): Pas de temps pour l'animation.
        chaos_factor (float): Intensité du chaos introduit (0 = stable, 1 = très chaotique).
        noise_level (float): Niveau de bruit ajouté aux positions des briques.

    Returns:
        Dict: Système mis à jour avec nouvelles positions/rotations.
    """
    updated_system = system.copy() # Créer une copie pour ne pas modifier l'original en place

    # Rotation globale des pyramides et dynamique chaotique pour chaque brique
    for pyramid in updated_system["pyramids"]:
        # Rotation aléatoire globale de la pyramide (peut être influencée par des facteurs)
        axis = np.random.randn(3)  # Axe aléatoire
        axis /= np.linalg.norm(axis) if np.linalg.norm(axis) != 0 else 1.0 # Normalisation, éviter div par zéro
        angle = time_step * (1.0 + chaos_factor * np.random.rand()) # Angle de rotation influencé par chaos

        rot = Rotation.from_rotvec(angle * axis) # Création de l'objet Rotation

        # Point central de la pyramide pour la rotation
        # Si vous voulez les faire tourner autour d'un centre commun, utilisez [0,0,0]
        # Sinon, utilisez pyramid["base_center"] ou calculez le centre de masse
        rotation_center = np.array(pyramid["base_center"]) 

        for brick in pyramid["bricks"]:
            pos = np.array(brick["position"])

            # 1. Application de la rotation globale de la pyramide
            # La rotation se fait autour du centre de la pyramide
            rotated_pos = rot.apply(pos - rotation_center) + rotation_center

            # 2. Dynamique chaotique de chaque brique (inspirée de Lorenz)
            # Cette dynamique est locale à la brique
            x, y, z = rotated_pos # Utilise la position après rotation comme base
            
            # Équations de Lorenz simplifiées (peuvent être ajustées pour différents comportements chaotiques)
            dx = chaos_factor * (y - x)
            dy = chaos_factor * (x * (28 - z) - y) # Exemple ajusté pour plus de chaos
            dz = chaos_factor * (x * y - z)
            
            # Ajout de bruit aux changements pour l'imprévisibilité
            brick_dx = time_step * dx + noise_level * np.random.randn()
            brick_dy = time_step * dy + noise_level * np.random.randn()
            brick_dz = time_step * dz + noise_level * np.random.randn()
            
            # Mise à jour de la position de la brique
            brick["position"] = [
                x + brick_dx,
                y + brick_dy,
                z + brick_dz
            ]
            
            # Normalisation optionnelle si les briques doivent rester dans une certaine limite
            # (par exemple, sur une sphère ou dans un volume défini)
            # Si les briques s'éloignent trop, leur position pourrait devenir impraticable.
            # Vous pouvez implémenter des "rebonds" ou des contraintes.

    return updated_system