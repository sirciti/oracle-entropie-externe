import numpy as np
import hashlib
import json
import time
import os
import logging
from typing import Tuple, Optional, List, Dict, Any

# Importer les fonctions et classes nécessaires des modules de géométrie réorganisés
from .geometry.icosahedron.generator import generate_klee_penrose_polyhedron
from .geometry.pyramids.generator import generate_pyramids_system
from .geometry.pyramids.dynamics import update_pyramids_dynamics
from .geometry.cubes.generator import CubeGenerator
from .geometry.cubes.dynamics import update_cubes_dynamics
from .fractal_lsystem import FractalLSystem
from .quantum_nodes import QuantumNode
from .temporal_entropy import get_world_timestamps, mix_timestamps

logger = logging.getLogger("entropy_generator")

# Paramètres par défaut pour la dynamique
DEFAULT_GEOMETRY_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'chaos_factor': 0.05,
    'noise_level': 0.1
}

def get_cubes_entropy(
    num_cubes: int = 3,
    cube_size: float = 8.0,
    num_balls_per_cube: int = 3,
    space_bounds: float = 30.0,
    simulation_steps: int = 10,
    delta_time: float = 0.016
) -> Optional[bytes]:
    """
    Génère de l'entropie à partir de la dynamique simulée d'un système de cubes et de billes.
    """
    try:
        cube_generator = CubeGenerator()
        cubes_system = cube_generator.generate_cubes_system(
            num_cubes=num_cubes,
            cube_size=cube_size,
            num_balls_per_cube=num_balls_per_cube,
            space_bounds=space_bounds
        )
        
        current_cubes_state = cubes_system
        for _ in range(simulation_steps):
            current_cubes_state = update_cubes_dynamics(
                current_cubes_state,
                delta_time=delta_time,
                gravity=-9.81 * 0.05,
                bounce_factor=0.85,
                confinement_size=space_bounds
            )
        
        signature_data = []
        for cube in current_cubes_state:
            signature_data.extend(cube["position"])
            signature_data.extend(cube["rotation"])
            signature_data.extend(cube["angular_velocity"])
            for ball in cube["balls"]:
                signature_data.extend(ball["position"])
                signature_data.extend(ball["velocity"])
        
        signature_string = json.dumps(signature_data, sort_keys=True)
        hashed_signature = hashlib.blake2b(signature_string.encode(), digest_size=32).digest()
        
        logger.info(f"Entropie des cubes générée avec succès: {hashed_signature.hex()}")
        return hashed_signature
    except Exception as e:
        logger.error(f"Erreur dans get_cubes_entropy: {e}")
        return None

def get_pyramids_entropy() -> Optional[bytes]:
    """Génère l'entropie basée sur l'animation des pyramides."""
    try:
        response = requests.get("http://127.0.0.1:5000/geometry/pyramids/animate?steps=10", timeout=5)
        if response.status_code == 200:
            frames = response.json()['frames']
            entropy = hashlib.sha256(json.dumps(frames, sort_keys=True).encode()).hexdigest()
            logger.info("Entropie des pyramides générée avec succès")
            return bytes.fromhex(entropy)
        logger.error("Échec de la récupération des données d'animation des pyramides")
        return None
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'entropie des pyramides : {e}")
        return None

def generate_quantum_geometric_entropy(
    use_weather: bool = True,
    use_icosahedron: bool = True,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True,
    use_cubes: bool = True,
    icosa_subdivisions: int = 1,
    pyramid_layers: int = 3,
    lsystem_iterations: int = 2,
    cubes_num_cubes: int = 3,
    cubes_cube_size: float = 8.0,
    cubes_num_balls_per_cube: int = 3,
    cubes_space_bounds: float = 30.0,
    get_area_weather_data=None,
    combine_weather_data=None,
    config=None,
    get_quantum_entropy=None
) -> Optional[bytes]:
    """
    Génère l'entropie finale en combinant diverses sources géométriques, temporelles, etc.
    Les sources peuvent être activées/désactivées via des drapeaux booléens.

    Args:
        use_weather, use_icosahedron, use_quantum, use_timestamps, use_local_noise, use_cubes: Activer/désactiver les sources.
        icosa_subdivisions, pyramid_layers, lsystem_iterations, cubes_*: Paramètres spécifiques aux géométries.
        get_area_weather_data, combine_weather_data, config, get_quantum_entropy: Dépendances passées pour éviter les imports circulaires.
    """
    try:
        seed_string_parts = [str(time.time_ns())]

        if use_weather and get_area_weather_data and combine_weather_data and config:
            all_weather_data_raw = get_area_weather_data(config['coordinates'])
            weather_data_processed = combine_weather_data(all_weather_data_raw)
            if weather_data_processed:
                seed_string_parts.append(json.dumps(weather_data_processed, sort_keys=True))
            else:
                logger.warning("Aucune donnée météo disponible.")

        if use_icosahedron:
            icosahedron_frames = generate_klee_penrose_polyhedron(subdivisions=icosa_subdivisions)
            if icosahedron_frames:
                seed_string_parts.append(json.dumps({"frames": icosahedron_frames[0].tolist()}, sort_keys=True))
            else:
                logger.warning("Aucune donnée d'icosaèdre générée.")

        if use_quantum and get_quantum_entropy:
            quantum_entropy_value = get_quantum_entropy()
            if quantum_entropy_value is not None:
                seed_string_parts.append(str(quantum_entropy_value))

        if use_timestamps:
            timestamps_list = get_world_timestamps()
            mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid')
            if mixed_timestamps_string:
                seed_string_parts.append(mixed_timestamps_string)
            else:
                logger.warning("Aucune entropie temporelle mondiale générée.")

        if use_local_noise:
            seed_string_parts.append(os.urandom(16).hex())

        if use_cubes:
            cubes_entropy_bytes = get_cubes_entropy(
                num_cubes=cubes_num_cubes,
                cube_size=cubes_cube_size,
                num_balls_per_cube=cubes_num_balls_per_cube,
                space_bounds=cubes_space_bounds
            )
            if cubes_entropy_bytes:
                seed_string_parts.append(cubes_entropy_bytes.hex())
            else:
                logger.warning("Aucune entropie des cubes générée.")

        if len(seed_string_parts) == 1:  # Seulement le timestamp
            logger.error("Aucune source d'entropie n'a contribué")
            return None

        seed_string = "".join(seed_string_parts)
        hasher = hashlib.blake2b(seed_string.encode(), digest_size=32)
        hashed_entropy = hasher.digest()
        logger.info("Entropie finale générée avec succès.")
        return hashed_entropy

    except Exception as e:
        logger.error(f"Erreur inattendue dans generate_quantum_geometric_entropy: {e}", exc_info=True)
        return None