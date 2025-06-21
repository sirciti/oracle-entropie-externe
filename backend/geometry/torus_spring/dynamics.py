import numpy as np
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

def update_torus_spring_dynamics(
    system_data: Dict[str, Any],
    delta_time: float = 0.016,
    oscillation_factor: float = 0.1
) -> Dict[str, Any]:
    """Met à jour la physique du système tore-ressorts-sphères."""
    try:
        spheres = system_data.get("spheres", [])
        springs = system_data.get("springs", [])
        physics = system_data.get("physics", {})
        
        gravity = np.array(physics.get("gravity", [0, 0, -0.1]))
        air_resistance = physics.get("air_resistance", 0.02)
        
        # Calcul des forces sur chaque sphère
        forces = {i: np.zeros(3) for i in range(len(spheres))}
        
        # Forces des ressorts
        for spring in springs:
            i, j = spring["sphere1"], spring["sphere2"]
            pos1 = np.array(spheres[i]["position"])
            pos2 = np.array(spheres[j]["position"])
            vel1 = np.array(spheres[i]["velocity"])
            vel2 = np.array(spheres[j]["velocity"])
            
            # Vecteur de connexion
            connection = pos2 - pos1
            distance = np.linalg.norm(connection)
            
            if distance > 0:
                direction = connection / distance
                
                # Force élastique (loi de Hooke)
                spring_force = spring["stiffness"] * (distance - spring["natural_length"])
                
                # Force d'amortissement
                relative_velocity = np.dot(vel2 - vel1, direction)
                damping_force = spring["damping"] * relative_velocity
                
                # Force totale du ressort
                total_force = (spring_force + damping_force) * direction
                
                forces[i] += total_force
                forces[j] -= total_force
        
        # Mise à jour des positions et vitesses
        for i, sphere in enumerate(spheres):
            mass = sphere["mass"]
            
            # Force totale = ressorts + gravité + résistance de l'air
            total_force = forces[i] + gravity * mass
            velocity = np.array(sphere["velocity"])
            total_force -= air_resistance * velocity * mass
            
            # Intégration de Verlet
            acceleration = total_force / mass
            new_velocity = velocity + acceleration * delta_time
            new_position = np.array(sphere["position"]) + new_velocity * delta_time
            
            # Oscillation toroïdale pour plus de dynamisme
            time_factor = np.sin(i * 0.1 + oscillation_factor)
            new_position += 0.1 * time_factor * np.array([
                np.cos(i * 0.2), np.sin(i * 0.2), np.cos(i * 0.3)
            ])
            
            # Mise à jour
            sphere["position"] = new_position.tolist()
            sphere["velocity"] = new_velocity.tolist()
        
        return system_data
        
    except Exception as e:
        logger.error(f"Erreur dynamique torus-spring: {e}")
        return system_data
