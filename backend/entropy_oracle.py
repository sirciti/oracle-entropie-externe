# backend/entropy_oracle.py

import numpy as np
import hashlib
from typing import Tuple, Optional, List, Dict, Any
import json
import time # Pour time.time_ns

# Importer les fonctions et classes nécessaires des modules de géométrie réorganisés
from .geometry.icosahedron.generator import generate_klee_penrose_polyhedron
from .geometry.pyramids.generator import generate_pyramids_system
from .geometry.pyramids.dynamics import update_pyramids_dynamics

# Import des générateurs et dynamiques pour les CUBES
from .geometry.cubes.generator import CubeGenerator
from .geometry.cubes.dynamics import update_cubes_dynamics

# Autres sources d'entropie
from .fractal_lsystem import FractalLSystem
from .quantum_nodes import QuantumNode
from .temporal_entropy import get_world_timestamps, mix_timestamps

# Paramètres par défaut pour la dynamique (partagés par les géométries si applicable)
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
        
        print(f"INFO: Entropie des cubes générée avec succès: {hashed_signature.hex()}")
        return hashed_signature
    except Exception as e:
        print(f"ERROR in get_cubes_entropy: {e}")
        return None


# --- FONCTION PRINCIPALE D'ORCHESTRATION D'ENTROPIE ---
def generate_quantum_geometric_entropy(
    use_weather: bool = True, # <-- NOUVEAUX PARAMÈTRES
    use_icosahedron: bool = True,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True,
    use_cubes: bool = True,
    icosa_subdivisions: int = 1, # Paramètres spécifiques à l'icosaèdre
    pyramid_layers: int = 3,     # Paramètres spécifiques aux pyramides
    lsystem_iterations: int = 2, # Paramètres spécifiques au L-system
    cubes_num_cubes: int = 3,    # Paramètres spécifiques aux cubes
    cubes_cube_size: float = 8.0,
    cubes_num_balls_per_cube: int = 3,
    cubes_space_bounds: float = 30.0
) -> Optional[bytes]:
    """
    Génère l'entropie finale en combinant diverses sources géométriques, temporelles, etc.
    Les sources peuvent être activées/désactivées via des drapeaux booléens.
    """
    try:
        seed_string_parts = []
        seed_string_parts.append(str(time.time_ns())) # Toujours inclure un timestamp pour la base

        if use_weather:
            # get_area_weather_data et combine_weather_data sont définies dans app.py
            # Pour éviter les imports circulaires, on peut les passer en paramètre ou les importer ici
            # Pour l'instant, on les importe ici pour simplifier.
            from backend.app import get_area_weather_data, combine_weather_data, config, logger # Importe les dépendances nécessaires
            all_weather_data_raw = get_area_weather_data(config['coordinates'])
            weather_data_processed = combine_weather_data(all_weather_data_raw)
            if not weather_data_processed:
                logger.error("Erreur lors de la récupération ou de la combinaison des données météo.")
                # Ne pas retourner None ici, juste ne pas ajouter à la seed_string
            else:
                seed_string_parts.append(json.dumps(weather_data_processed, sort_keys=True))

        if use_icosahedron:
            # generate_klee_penrose_polyhedron est importé en haut
            icosahedron_frames = generate_klee_penrose_polyhedron(subdivisions=icosa_subdivisions)
            if icosahedron_frames:
                seed_string_parts.append(json.dumps({"frames": icosahedron_frames[0].tolist()}, sort_keys=True)) # Utilise juste les vertices de la première frame
            else:
                logger.warning("Aucune donnée d'icosaèdre générée.")

        if use_quantum:
            # get_quantum_entropy est défini dans app.py
            from backend.app import get_quantum_entropy
            quantum_entropy_value = get_quantum_entropy()
            if quantum_entropy_value is not None:
                seed_string_parts.append(str(quantum_entropy_value))

        if use_timestamps:
            # get_world_timestamps et mix_timestamps sont importés en haut
            timestamps_list = get_world_timestamps()
            mixed_timestamps_string = mix_timestamps(timestamps_list, mode='hybrid')
            if mixed_timestamps_string:
                seed_string_parts.append(mixed_timestamps_string)
            else:
                logger.warning("Aucune entropie temporelle mondiale générée.")

        if use_local_noise:
            seed_string_parts.append(os.urandom(16).hex())

        if use_cubes:
            # get_cubes_entropy est défini dans ce même fichier
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


        # Assurez-vous qu'au moins une source d'entropie a contribué
        if not seed_string_parts:
            # Si aucune source n'a pu contribuer, c'est une erreur
            # Ou si seul le timestamp initial est là, c'est ok.
            # Le timestamp initial est toujours ajouté, donc seed_string_parts ne devrait pas être vide.
            logger.error("La chaîne de graine est vide après la collecte des sources d'entropie.")
            return None

        seed_string = "".join(seed_string_parts)
        
        hasher = hashlib.blake2b(seed_string.encode(), digest_size=32)
        hashed_entropy = hasher.digest()
        logger.info("Entropie finale générée avec succès.")
        return hashed_entropy

    except Exception as e:
        logger.error(f"Erreur inattendue dans generate_quantum_geometric_entropy: {e}", exc_info=True) # exc_info=True pour le traceback
        return None