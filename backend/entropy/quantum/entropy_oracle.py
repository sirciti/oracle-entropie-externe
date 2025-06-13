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
from geometry.icosahedron.generator import generate_klee_penrose_polyhedron
from geometry.spiral_torus.generator import generate_toroidal_spiral_system
from geometry.spiral_torus.dynamics import update_toroidal_spiral_dynamics
from geometry.cubes.generator import CubeGenerator
from geometry.cubes.dynamics import update_cubes_dynamics

# --- AUTRES SOURCES D'ENTROPIE ET UTILITAIRES ---
from geometry.fractal import FractalLSystem
from entropy.quantum.quantum_nodes import QuantumNode
from entropy.temporal.temporal_entropy import get_world_timestamps, mix_timestamps
from streams.token_stream import get_final_entropy

logger = logging.getLogger("entropy_oracle")

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

# --- FONCTION: OBTENIR L'ENTROPIE DES CUBES ---
def get_cubes_entropy(
    num_cubes: int = 3,
    cube_size: float = 8.0,
    num_balls_per_cube: int = 3,
    space_bounds: float = 30.0,
    simulation_steps: int = 10,
    delta_time: float = 0.016
) -> Optional[bytes]:
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
                chaos_factor=0.05
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

# --- FONCTION: OBTENIR L'ENTROPIE DES SPIRALES SIMPLES ---
def get_spiral_entropy(
    config: Dict[str, Any],
    steps: int = 1000,
    radius: float = 1.0,
    height: float = 2.0,
    use_weather: bool = True,
    use_quantum: bool = True,
    get_area_weather_data=None,
    combine_weather_data=None,
    get_entropy_data=None
) -> List[Dict[str, Any]]:
    try:
        if get_entropy_data is None:
            raise ValueError("La fonction utilitaire get_entropy_data doit être fournie en argument.")
        entropy = get_entropy_data()
        import numpy as np
        np.random.seed(int(entropy * 1000) % 2**32)
        theta = np.linspace(0, 4 * np.pi, steps)
        z = np.linspace(-height / 2, height / 2, steps)
        r = radius * (1 + 0.1 * np.sin(theta))
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        points = np.vstack((x, y, z)).T.tolist()

        weather_influence = 1.0
        if use_weather and get_area_weather_data and combine_weather_data and config:
            weather_data = get_area_weather_data(config.get('coordinates', {}))
            processed_weather = combine_weather_data(weather_data)
            if processed_weather:
                temp = processed_weather.get('temperature', 20.0)
                weather_influence = 1.0 + 0.01 * (temp - 20.0)
                points = [[p[0] * weather_influence, p[1] * weather_influence, p[2]] for p in points]

        entropy_data = {
            "points": points,
            "timestamp": time.time_ns(),
            "weather_influence": weather_influence
        }
        entropy_string = json.dumps(entropy_data, sort_keys=True)
        entropy_hash = hashlib.sha3_512(entropy_string.encode()).digest().hex()

        frames = [{
            "spiral_positions": points,
            "entropy_hash": entropy_hash
        }]
        logger.info("Entropie spirale générée avec succès")
        return frames
    except Exception as e:
        logger.error(f"Erreur dans get_spiral_entropy : {e}")
        return []

# --- FONCTION: OBTENIR L'ENTROPIE DES SPIRALES TOROÏDALES ---
def get_spiral_torus_entropy(
    R: float = 8.0,
    r: float = 2.0,
    n_turns: int = 3,
    n_points: int = 24,
    simulation_steps: int = 10,
    delta_time: float = 0.016,
    chaos_factor: float = 0.05,
    noise_level: float = 0.1
) -> Optional[bytes]:
    try:
        system = generate_toroidal_spiral_system(R, r, n_turns, n_points)
        current_system = system
        for _ in range(simulation_steps):
            current_system = update_toroidal_spiral_dynamics(
                current_system,
                delta_time=delta_time,
                chaos_factor=chaos_factor,
                noise_level=noise_level
            )
        
        signature_data = []
        for point in current_system["spiral"]["points"]:
            signature_data.extend(point["position"])
            signature_data.append(point["size"])
        
        signature_string = json.dumps(signature_data, sort_keys=True)
        hashed_signature = hashlib.blake2b(signature_string.encode(), digest_size=32).digest()
        logger.info(f"Entropie de la spirale toroïdale générée: {hashed_signature.hex()}")
        return hashed_signature
    except Exception as e:
        logger.error(f"Erreur dans get_spiral_torus_entropy: {e}", exc_info=True)
        return None

# --- FONCTION PRINCIPALE D'ORCHESTRATION D'ENTROPIE ---
def generate_quantum_geometric_entropy(
    length: int = 32,
    use_weather: bool = True,
    use_icosahedron: bool = True,
    use_quantum: bool = True,
    use_timestamps: bool = True,
    use_local_noise: bool = True,
    use_cubes: bool = True,
    use_spiral_simple: bool = True,
    use_spiral_torus: bool = True,
    geometries: Optional[List[str]] = None,
    icosa_subdivisions: int = 1,
    spiral_simple_steps: int = 1000,
    spiral_simple_radius: float = 1.0,
    spiral_simple_height: float = 2.0,
    spiral_torus_R: float = 8.0,
    spiral_torus_r: float = 2.0,
    spiral_torus_n_turns: int = 3,
    spiral_torus_n_points: int = 24,
    lsystem_iterations: int = 2,
    cubes_num_cubes: int = 3,
    cubes_cube_size: float = 8.0,
    cubes_num_balls_per_cube: int = 3,
    cubes_space_bounds: float = 30.0,
    get_area_weather_data=None,
    combine_weather_data=None,
    config: Optional[Dict] = None,
    get_quantum_entropy=None
) -> Optional[bytes]:
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
                seed_string_parts.append(json.dumps({"vertices": icosahedron_frames["vertices"]}, sort_keys=True))
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

        # Entropie Spirale Simple
        if use_spiral_simple:
            spiral_simple_frames = get_spiral_entropy(
                config=config,
                steps=spiral_simple_steps,
                radius=spiral_simple_radius,
                height=spiral_simple_height,
                use_weather=use_weather,
                use_quantum=use_quantum,
                get_area_weather_data=get_area_weather_data,
                combine_weather_data=combine_weather_data,
                get_entropy_data=get_final_entropy
            )
            if spiral_simple_frames:
                seed_string_parts.append(json.dumps(spiral_simple_frames, sort_keys=True))
            else:
                logger.warning("Aucune entropie de spirale simple générée.")

        # Entropie Spirale Toroïdale
        if use_spiral_torus:
            spiral_torus_entropy_bytes = get_spiral_torus_entropy(
                R=spiral_torus_R,
                r=spiral_torus_r,
                n_turns=spiral_torus_n_turns,
                n_points=spiral_torus_n_points
            )
            if spiral_torus_entropy_bytes:
                seed_string_parts.append(spiral_torus_entropy_bytes.hex())
            else:
                logger.warning("Aucune entropie de la spirale toroïdale générée.")

        # Vérification des sources d'entropie
        if len(seed_string_parts) == 1 and seed_string_parts[0] == str(time.time_ns()):
            logger.error("Aucune source d'entropie (hors timestamp) n'a contribué.")
            return None

        seed_string = "".join(seed_string_parts)
        
        # Hachage final
        if BLAKE3_AVAILABLE:
            seed = blake3.blake3(seed_string.encode()).digest(length)
        else:
            logger.warning("BLAKE3 non disponible, fallback vers SHA3-512.")
            seed = hashlib.sha3_512(seed_string.encode()).digest()[:length]

        logger.info("Entropie finale générée avec succès.")
        return seed
    except Exception as e:
        logger.error(f"Erreur inattendue dans generate_quantum_geometric_entropy: {e}", exc_info=True)
        return None