import numpy as np
from core.utils.utils import get_entropy_data
import logging

logger = logging.getLogger(__name__)

def generate_torus_spring_system(
    major_radius: float = 8.0,
    minor_radius: float = 3.0,
    num_spheres: int = 20,
    spring_stiffness: float = 0.5,
    sphere_mass: float = 1.0
) -> dict:
    """Génère un système tore + sphères connectées par ressorts."""
    try:
        entropy = get_entropy_data()
        np.random.seed(int(entropy * 1000) % 2**32)
        
        # Positions des sphères sur la surface du tore
        spheres = []
        springs = []
        
        # Paramètres toroïdaux
        u_values = np.linspace(0, 2 * np.pi, num_spheres, endpoint=False)
        v_values = np.random.uniform(0, 2 * np.pi, num_spheres)  # Variation aléatoire
        
        # Génération des sphères
        for i in range(num_spheres):
            u, v = u_values[i], v_values[i]
            
            # Position sur le tore
            x = (major_radius + minor_radius * np.cos(v)) * np.cos(u)
            y = (major_radius + minor_radius * np.cos(v)) * np.sin(u)
            z = minor_radius * np.sin(v)
            
            # Vitesse initiale aléatoire
            velocity = np.random.uniform(-0.2, 0.2, 3)
            
            spheres.append({
                "id": i,
                "position": [x, y, z],
                "velocity": velocity.tolist(),
                "mass": sphere_mass,
                "radius": 0.5,
                "color": [
                    0.5 + 0.5 * np.sin(i * 0.3),
                    0.5 + 0.5 * np.cos(i * 0.4),
                    0.5 + 0.5 * np.sin(i * 0.5)
                ]
            })
        
        # Génération des ressorts (connexions entre sphères voisines)
        for i in range(num_spheres):
            # Connexion avec le voisin suivant (circulaire)
            next_sphere = (i + 1) % num_spheres
            
            # Distance naturelle du ressort
            pos1 = np.array(spheres[i]["position"])
            pos2 = np.array(spheres[next_sphere]["position"])
            natural_length = np.linalg.norm(pos2 - pos1)
            
            springs.append({
                "id": len(springs),
                "sphere1": i,
                "sphere2": next_sphere,
                "stiffness": spring_stiffness,
                "damping": 0.1,
                "natural_length": natural_length,
                "color": [0.8, 0.8, 0.2]  # Jaune doré
            })
            
            # Connexions croisées pour plus de stabilité (tous les 3 sphères)
            if i % 3 == 0:
                cross_sphere = (i + num_spheres // 2) % num_spheres
                pos_cross = np.array(spheres[cross_sphere]["position"])
                cross_length = np.linalg.norm(pos_cross - pos1)
                
                springs.append({
                    "id": len(springs),
                    "sphere1": i,
                    "sphere2": cross_sphere,
                    "stiffness": spring_stiffness * 0.3,  # Plus faible
                    "damping": 0.05,
                    "natural_length": cross_length,
                    "color": [0.2, 0.8, 0.8]  # Cyan
                })
        
        return {
            "type": "torus_spring_system",
            "torus": {
                "major_radius": major_radius,
                "minor_radius": minor_radius
            },
            "spheres": spheres,
            "springs": springs,
            "entropy": entropy,
            "physics": {
                "gravity": [0, 0, -0.1],
                "air_resistance": 0.02
            }
        }
        
    except Exception as e:
        logger.error(f"Erreur génération torus-spring: {e}")
        return {"error": str(e)}
