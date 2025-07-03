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
        
        theta = np.linspace(0, 8 * np.pi, steps)
        z = np.linspace(-height / 2, height / 2, steps)
        z_normalized = (z + height/2) / height
        z_abs_norm = np.abs(z) / (height/2)
        base_radius = radius * 2.5
        top_radius = radius * 0.4
        extremity_radius = radius * 1.8
        r_tornado = base_radius * (1 - z_normalized) + top_radius * z_normalized
        r_extension = extremity_radius * z_abs_norm
        r = r_tornado * (1 - z_abs_norm * 0.3) + r_extension * 0.7
        r = r * (1 + 0.2 * np.sin(theta * 2))
        r = r * (1 + 0.15 * np.sin(theta * 0.5))
        r = r * (1 + 0.1 * np.sin(z_normalized * 4 * np.pi))
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

def generate_spiral_initial(*args, **kwargs):
    return generate_spiral(*args, **kwargs)

# --- ALIAS attendu par le backend ---
def generate_spiral_simple_initial(*args, **kwargs):
    return generate_spiral(*args, **kwargs)
