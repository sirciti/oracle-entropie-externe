from .generator import generate_spiral
from .dynamics import update_spiral_dynamics
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger("spiral")

def generate_spiral_initial():
    """Génère une spirale 3D initiale."""
    return generate_spiral()

def animate_spiral(steps: int = 10, delta_time: float = 0.01):
    """Génère une animation de la spirale."""
    try:
        spiral = generate_spiral()
        frames = []
        current_spiral = spiral
        for _ in range(steps):
            current_spiral = update_spiral_dynamics(current_spiral, delta_time)
            frames.append({
                "positions": current_spiral["positions"],
                "entropy": current_spiral["entropy"]
            })
        return {"frames": frames}
    except Exception as e:
        logger.error(f"Erreur dans animate_spiral : {e}")
        return {"error": str(e)}