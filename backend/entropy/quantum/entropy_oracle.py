import os
import time
import json
import hashlib
import logging
from typing import Optional, List, Dict, Any, Tuple

try:
    import blake3
    BLAKE3_AVAILABLE = True
except ImportError:
    BLAKE3_AVAILABLE = False

# --- IMPORTS DES MODULES GÉOMÉTRIQUES ---
from backend.geometry.icosahedron.generator import generate_klee_penrose_polyhedron
from backend.geometry.pyramids.generator import generate_pyramids_system
from backend.geometry.pyramids.dynamics import update_pyramids_dynamics
from backend.geometry.cubes.generator import CubeGenerator
from backend.geometry.cubes.dynamics import update_cubes_dynamics

# --- AUTRES SOURCES D'ENTROPIE ET UTILITAIRES ---
from backend.geometry.fractal import FractalLSystem # <-- CORRECTION ICI : nouveau chemin et nom
from backend.entropy.quantum.quantum_nodes import QuantumNode
from backend.entropy.temporal.temporal_entropy import get_world_timestamps, mix_timestamps

# Import des fonctions utilitaires depuis backend.core.utils.utils
# Ces fonctions sont passées en arguments depuis app.py pour éviter les imports circulaires
# ou pour permettre une injection de dépendances.
# Pour le test direct de entropy_oracle.py, nous aurons besoin de mocks ou d'imports conditionnels.
# Pour l'exécution via app.py, ces imports sont gérés par app.py.

logger = logging.getLogger("entropy_oracle")

# Paramètres par défaut pour la dynamique (peut être déplacé dans un fichier de config global si complexe)
DEFAULT_GEOMETRY_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'chaos_factor': 0.05,
    'noise_level': 0.1
}

# --- FONCTION: OBTENIR L'ENTROPIE DES CUBES ---
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
        logger.error(f"Erreur dans get_cubes_entropy: {e}", exc_info=True)
        return None

# --- FONCTION: OBTENIR L'ENTROPIE DES PYRAMIDES ---
def get_pyramids_entropy(
    base_size: float = 5.0,
    num_layers: int = 3,
    brick_size: float = 1.0,
    simulation_steps: int = 10,
    delta_time: float = 0.016,
    chaos_factor: float = 0.05,
    noise_level: float = 0.1
) -> Optional[bytes]:
    """
    Génère de l'entropie à partir de la dynamique simulée d'un système de pyramides.
    """
    try:
        pyramids_system = generate_pyramids_system(base_size=base_size, num_layers=num_layers, brick_size=brick_size)
        current_system_state = pyramids_system
        for _ in range(simulation_steps):
            current_system_state = update_pyramids_dynamics(current_system_state, delta_time=delta_time, chaos_factor=chaos_factor, noise_level=noise_level)
        
        signature_data = []
        for p in current_system_state["pyramids"]:
            signature_data.extend(p["apex_position"])
            for b in p["bricks"]:
                signature_data.extend(b["position"])
            for ball in p["balls"]:
                signature_data.extend(ball["position"])
        
        signature_string = json.dumps(signature_data, sort_keys=True)
        hashed_signature = hashlib.blake2b(signature_string.encode(), digest_size=32).digest()
        
        logger.info("Entropie des pyramides générée avec succès")
        return hashed_signature
    except Exception as e:
        logger.error(f"Erreur lors de la génération de l'entropie des pyramides : {e}", exc_info=True)
        return None

# --- FONCTION PRINCIPALE D'ORCHESTRATION D'ENTROPIE ---
def generate_quantum_geometric_entropy(
    use_weather: bool = True, 
    use_icosahedron: bool = True,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True,
    use_cubes: bool = True,
    use_pyramids: bool = True,
    # Paramètres pour les différentes sources
    icosa_subdivisions: int = 1,
    pyramid_layers: int = 3,
    lsystem_iterations: int = 2,
    cubes_num_cubes: int = 3,    
    cubes_cube_size: float = 8.0,
    cubes_num_balls_per_cube: int = 3,
    cubes_space_bounds: float = 30.0,
    pyramids_base_size: float = 10.0,
    pyramids_num_layers: int = 5,
    pyramids_brick_size: float = 2.0,
    
    # Fonctions utilitaires passées en argument pour éviter les imports circulaires
    get_area_weather_data=None, 
    combine_weather_data=None,   
    config=None,                 
    get_quantum_entropy=None     
) -> Optional[bytes]:
    """
    Génère l'entropie finale en combinant diverses sources.
    """
    try:
        seed_string_parts = []
        seed_string_parts.append(str(time.time_ns()))

        # Entropie Météo
        if use_weather and get_area_weather_data and combine_weather_data and config:
            all_weather_data_raw = get_area_weather_data(config['coordinates'])
            weather_data_processed = combine_weather_data(all_weather_data_raw)
            if weather_data_processed:
                seed_string_parts.append(json.dumps(weather_data_processed, sort_keys=True))
            else:
                logger.warning("Aucune donnée météo disponible.")

        # Entropie Icosaèdre
        if use_icosahedron:
            icosahedron_frames = generate_klee_penrose_polyhedron(subdivisions=icosa_subdivisions)
            if icosahedron_frames:
                seed_string_parts.append(json.dumps({"vertices": icosahedron_frames[0].tolist()}, sort_keys=True))
            else:
                logger.warning("Aucune donnée d'icosaèdre générée.")

        # Entropie Quantique
        if use_quantum and get_quantum_entropy:
            quantum_entropy_value = get_quantum_entropy()
            if quantum_entropy_value is not None:
                seed_string_parts.append(str(quantum_entropy_value))

        # Entropie Temporelle
        if use_timestamps:
            timestamps_list = get_world_timestamps()
            mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid')
            if mixed_timestamps_string:
                seed_string_parts.append(mixed_timestamps_string)
            else:
                logger.warning("Aucune entropie temporelle mondiale générée.")

        # Entropie Bruit Local
        if use_local_noise:
            seed_string_parts.append(os.urandom(16).hex())

        # Entropie Cubes
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

        # Entropie Pyramides
        if use_pyramids:
            pyramids_entropy_bytes = get_pyramids_entropy(
                base_size=pyramids_base_size,
                num_layers=pyramids_num_layers,
                brick_size=pyramids_brick_size,
            )
            if pyramids_entropy_bytes:
                seed_string_parts.append(pyramids_entropy_bytes.hex())
            else:
                logger.warning("Aucune entropie des pyramides générée.")

        # Assurez-vous qu'au moins une source d'entropie a contribué (hors timestamp initial)
        if len(seed_string_parts) == 1 and seed_string_parts[0] == str(time.time_ns()):
            logger.error("Aucune source d'entropie (hors timestamp) n'a contribué.")
            return None

        seed_string = "".join(seed_string_parts)
        
        # Hachage final : BLAKE3 prioritaire
        if BLAKE3_AVAILABLE:
            seed = blake3.blake3(seed_string.encode()).digest()
        else:
            logger.warning("BLAKE3 non disponible, fallback vers SHA3-512.")
            seed = hashlib.sha3_512(seed_string.encode()).digest()

        logger.info("Entropie finale générée avec succès.")
        return seed

    except Exception as e:
        logger.error(f"Erreur inattendue dans generate_quantum_geometric_entropy: {e}", exc_info=True)
        return None