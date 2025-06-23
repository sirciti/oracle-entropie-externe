import numpy as np
from typing import Dict, Any
import logging
import time

logger = logging.getLogger(__name__)

def update_centrifuge_laser_dynamics(
    system_data: Dict[str, Any],
    delta_time: float = 0.016,
    rotation_speed: float = 0.02
) -> Dict[str, Any]:
    """Met à jour la dynamique de la centrifugeuse laser."""
    try:
        current_time = time.time()
        
        # Rotation de la centrifugeuse
        centrifuge_rotation = current_time * rotation_speed
        
        # Pulse laser
        pulse = (np.sin(current_time * system_data["laser_center"]["pulse_frequency"]) + 1) / 2
        system_data["laser_center"]["intensity"] = 0.5 + pulse * 1.5
        
        # Couleur laser changeante
        hue = (current_time * 0.001) % 1
        system_data["laser_center"]["color"] = [
            0.5 + 0.5 * np.sin(hue * 2 * np.pi),
            0.5 + 0.5 * np.sin((hue + 0.33) * 2 * np.pi),
            0.5 + 0.5 * np.sin((hue + 0.66) * 2 * np.pi)
        ]
        
        # Rotation des tiges
        system_data["arm_top"]["rotation"] = centrifuge_rotation
        system_data["arm_bottom"]["rotation"] = centrifuge_rotation * 0.7  # Vitesse différente
        
        # Mouvement des sphères (effet voile avec inertie)
        for sphere in system_data["spheres"]:
            delayed_rotation = centrifuge_rotation * sphere["inertia_delay"]
            angle = sphere["initial_angle"] + delayed_rotation
            
            # Effet centrifuge + voile
            radius = 5 + np.cos(angle * 2) * 1.5 + pulse * 0.5
            height = radius * np.sin(angle) + np.sin(delayed_rotation * 3) * 0.8
            
            sphere["position"] = [
                np.cos(angle * 1.5) * (2 + pulse * 0.3),
                height,
                np.cos(angle * 3) * 1.5
            ]
        
        # Mouvement des cubes (opposition de phase)
        for cube in system_data["cubes"]:
            delayed_rotation = -centrifuge_rotation * cube["inertia_delay"]  # Opposition
            angle = cube["initial_angle"] + delayed_rotation
            
            # Effet centrifuge horizontal
            radius = 6 + np.sin(angle * 3) * 2 + pulse * 0.8
            
            cube["position"] = [
                radius * np.cos(angle),
                np.sin(angle * 2) * 1.5 + np.cos(delayed_rotation * 2) * 0.5,
                np.sin(angle * 4) * 1
            ]
        
        return system_data
        
    except Exception as e:
        logger.error(f"Erreur dynamique centrifuge laser: {e}")
        return system_data
