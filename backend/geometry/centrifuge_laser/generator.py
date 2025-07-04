import numpy as np
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger(__name__)

def generate_centrifuge_laser_system(
    num_spheres: int = 12,
    num_cubes: int = 8,
    laser_intensity: float = 1.0
) -> dict:
    """Génère un système de centrifugeuse laser pour l'entropie."""
    try:
        entropy = get_entropy_data()
        np.random.seed(int(entropy * 1000) % 2**32)
        
        # Centre laser
        laser_center = {
            "position": [0, 0, 0],
            "intensity": laser_intensity,
            "color": [0, 1, 1],  # Cyan
            "pulse_frequency": 0.005
        }
        
        # Tige 12h (verticale) - Sphères
        arm_top = {
            "position": [0, 4, 0],
            "rotation": 0,
            "length": 8,
            "type": "vertical"
        }
        
        # Tige 6h (horizontale) - Cubes
        arm_bottom = {
            "position": [4, 0, 0], 
            "rotation": 0,
            "length": 8,
            "type": "horizontal"
        }
        
        # Sphères avec positions initiales
        spheres = []
        for i in range(num_spheres):
            angle = (i / num_spheres) * 2 * np.pi
            radius = 5 + np.cos(angle * 2) * 1.5
            
            spheres.append({
                "id": i,
                "position": [
                    np.cos(angle * 1.5) * 2,
                    radius * np.sin(angle),
                    np.cos(angle * 3) * 1.5
                ],
                "velocity": [0, 0, 0],
                "radius": 0.5,
                "color": [
                    0.3 + 0.7 * np.sin(i * 0.5),
                    0.3 + 0.7 * np.cos(i * 0.7),
                    0.8
                ],
                "initial_angle": angle,
                "inertia_delay": np.random.uniform(0.3, 0.8)
            })
        
        # Cubes avec positions initiales
        cubes = []
        for i in range(num_cubes):
            angle = (i / num_cubes) * 2 * np.pi
            radius = 6 + np.sin(angle * 3) * 2
            
            cubes.append({
                "id": i,
                "position": [
                    radius * np.cos(angle),
                    np.sin(angle * 2) * 1.5,
                    np.sin(angle * 4) * 1
                ],
                "velocity": [0, 0, 0],
                "size": 0.6,
                "color": [
                    0.8,
                    0.3 + 0.7 * np.sin(i * 0.3),
                    0.3 + 0.7 * np.cos(i * 0.4)
                ],
                "initial_angle": angle,
                "inertia_delay": np.random.uniform(0.3, 0.8)
            })
        
        return {
            "type": "centrifuge_laser_system",
            "laser_center": laser_center,
            "arm_top": arm_top,
            "arm_bottom": arm_bottom,
            "spheres": spheres,
            "cubes": cubes,
            "entropy": entropy,
            "physics": {
                "centrifuge_speed": 0.02,
                "inertia_factor": 0.7,
                "pulse_sync": True
            }
        }
        
    except Exception as e:
        logger.error(f"Erreur génération centrifuge laser: {e}")
        return {"error": str(e)}
    
def generate_centrifuge_laser_data(*args, **kwargs):
    return generate_centrifuge_laser_system(*args, **kwargs)

