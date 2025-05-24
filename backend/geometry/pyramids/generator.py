import numpy as np
from typing import Dict, List, Tuple, Any

def generate_pyramids_system(
    base_size: float = 5.0,
    num_layers: int = 3,
    brick_size: float = 1.0,
    seed: int = None
) -> Dict[str, Any]:
    """
    Génère deux pyramides opposées par leur base, composées de briques.

    Args:
        base_size (float): Taille de la base carrée (côté).
        num_layers (int): Nombre de couches de briques par pyramide.
        brick_size (float): Taille d'une brique (côté).
        seed (int): Graine pour la reproductibilité (optionnel).

    Returns:
        Dict: Système de pyramides avec coordonnées, couleurs, et métadonnées.
    """
    if seed is not None:
        np.random.seed(seed)

    system = {
        "pyramids": [],
        "metadata": {
            "base_size": base_size,
            "num_layers": num_layers,
            "brick_size": brick_size,
            "seed": seed
        }
    }

    # Génération des deux pyramides
    for pyramid_id in [0, 1]:
        pyramid = {
            "id": pyramid_id,
            "bricks": [],
            # Ajustement de la base_center pour espacer les pyramides et les aligner
            "base_center": [0.0, 0.0, 0.0] # Centrer initialement pour la rotation
        }
        
        # Décalage vertical initial des pyramides pour les opposer par la base
        pyramid_offset_y = (num_layers - 1) * brick_size / 2.0 # Centre la base au niveau y=0
        
        # Le sens de la pyramide (vers le haut pour 0, vers le bas pour 1)
        direction = (1 if pyramid_id == 0 else -1)

        # Génération des briques par couche
        for layer in range(num_layers):
            # La taille de la couche diminue vers le sommet
            # current_layer_bricks_per_side = num_layers - layer
            current_layer_bricks_per_side = int(base_size / brick_size) - layer # Par exemple
            if current_layer_bricks_per_side < 1:
                current_layer_bricks_per_side = 1 # S'assurer qu'il y a au moins 1 brique au sommet
            
            layer_offset_x = (current_layer_bricks_per_side - 1) * brick_size / 2.0
            layer_offset_z = (current_layer_bricks_per_side - 1) * brick_size / 2.0

            # Positionnement des briques dans la couche
            for x_idx in range(current_layer_bricks_per_side):
                for z_idx in range(current_layer_bricks_per_side):
                    # Calcul de la position X et Z dans la couche, centrée
                    x_pos = x_idx * brick_size - layer_offset_x
                    z_pos = z_idx * brick_size - layer_offset_z
                    
                    # Hauteur Y de la couche
                    y_pos = layer * brick_size * direction - pyramid_offset_y * direction

                    # Ajout de variations aléatoires pour l'entropie
                    # Les offsets sont relatifs à la taille de la brique
                    offset = np.random.uniform(-0.1, 0.1, size=3) * brick_size
                    # Couleur RGB aléatoire
                    color = np.random.rand(3).tolist()

                    brick = {
                        "position": [x_pos + offset[0], y_pos + offset[1], z_pos + offset[2]],
                        "size": brick_size,
                        "color": color,
                        "layer": layer,
                        "pyramid_id": pyramid_id # Ajoute l'ID de la pyramide à la brique
                    }
                    pyramid["bricks"].append(brick)
        system["pyramids"].append(pyramid) # <-- Correction: Ajout de la pyramide une seule fois après ses briques
    
    return system