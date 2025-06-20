import numpy as np
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger(__name__)

def generate_spiral(
    radius: float = 1.0,
    height: float = 4.0,
    steps: int = 150
) -> dict:
    """Génère une spirale 3D fusionnée : tornade + extension aux extrémités."""
    try:
        entropy = get_entropy_data()
        np.random.seed(int(entropy * 1000) % 2**32)
        
        theta = np.linspace(0, 8 * np.pi, steps)  # Plus de tours pour plus de fluidité
        z = np.linspace(-height / 2, height / 2, steps)
        
        # Normaliser z entre 0 et 1 (pour effet tornade)
        z_normalized = (z + height/2) / height
        
        # Distance absolue du centre (pour extension aux extrémités)
        z_abs_norm = np.abs(z) / (height/2)
        
        # FUSION INNOVANTE : Combine tornade + extension
        base_radius = radius * 2.5      # Rayon de base large
        top_radius = radius * 0.4       # Sommet étroit (tornade)
        extremity_radius = radius * 1.8  # Extension aux bouts
        
        # Rayon fusionné : diminue vers le haut ET s'étend aux extrémités
        r_tornado = base_radius * (1 - z_normalized) + top_radius * z_normalized
        r_extension = extremity_radius * z_abs_norm
        
        # Fusion avec pondération
        r = r_tornado * (1 - z_abs_norm * 0.3) + r_extension * 0.7
        
        # INNOVATION : Triple oscillation pour plus de complexité
        r = r * (1 + 0.2 * np.sin(theta * 2))        # Oscillation rapide
        r = r * (1 + 0.15 * np.sin(theta * 0.5))     # Oscillation lente
        r = r * (1 + 0.1 * np.sin(z_normalized * 4 * np.pi))  # Oscillation verticale
        
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        
        points = np.vstack((x, y, z)).T.tolist()
        return {
            "type": "fusion_tornado_spiral",
            "positions": points,
            "entropy": entropy
        }
    except Exception as e:
        logger.error(f"Erreur dans generate_spiral : {e}")
        return {"error": str(e)}

def generate_spiral_simple_initial(*args, **kwargs):
    return generate_spiral(*args, **kwargs)