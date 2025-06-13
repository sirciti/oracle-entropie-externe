import numpy as np
from core.utils.utils import get_entropy_data

def generate_spiral(
    radius: float = 1.0,
    height: float = 2.0,
    steps: int = 100
) -> dict:
    """Génère une spirale 3D initiale."""
    try:
        entropy = get_entropy_data()
        np.random.seed(int(entropy * 1000) % 2**32)
        theta = np.linspace(0, 4 * np.pi, steps)
        z = np.linspace(-height / 2, height / 2, steps)
        r = radius * (1 + 0.1 * np.sin(theta))
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        points = np.vstack((x, y, z)).T.tolist()
        return {
            "type": "spiral",
            "positions": points,
            "entropy": entropy
        }
    except Exception as e:
        logger.error(f"Erreur dans generate_spiral : {e}")
        return {"error": str(e)}

def generate_spiral_simple_initial(*args, **kwargs):
    return generate_spiral(*args, **kwargs)