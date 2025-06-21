import logging
import json
import numpy as np
from flask import Blueprint, jsonify, request
from typing import Optional, List

from core.utils.utils import load_config

from geometry.icosahedron.generator import generate_icosahedron, subdivide_faces, generate_klee_penrose_polyhedron
from geometry.icosahedron.dynamics import update_icosahedron_dynamics
from geometry.spiral_torus.dynamics import update_toroidal_spiral_dynamics
from geometry.spiral_torus.generator import generate_toroidal_spiral_system
from geometry.cubes.generator import CubeGenerator
from geometry.cubes.dynamics import update_cubes_dynamics
from geometry.spiral.generator import generate_spiral_simple_initial
from geometry.spiral.dynamics import animate_spiral_simple
from geometry.torus_spring.generator import generate_torus_spring_system
from geometry.torus_spring.dynamics import update_torus_spring_dynamics

geometry_api = Blueprint('geometry_api', __name__)

# Charger la configuration
config = load_config()
logger = logging.getLogger("geometry_api")

# Paramètres par défaut pour la dynamique
DEFAULT_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'steps': 10,
    'chaos_factor': 0.05,
    'noise_level': 0.1
}

DEFAULT_CUBES_CONFIG = {
    'num_cubes': 10,
    'cube_size': 8.0,
    'num_balls_per_cube': 3,
    'space_bounds': 30.0,
    'dt': 0.016,
    'steps': 80
}

def parse_float_list(s: str) -> Optional[List[float]]:
    """Tente d'analyser une chaîne en une liste de floats."""
    try:
        data = json.loads(s)
        if isinstance(data, list) and all(isinstance(x, (int, float)) for x in data):
            return [float(x) for x in data]
        return None
    except (json.JSONDecodeError, TypeError):
        return None

# --- ROUTES POUR L'ICOSAÈDRE ---
@geometry_api.route("/icosahedron/initial", methods=["GET"])
def icosahedron_initial():
    vertices, faces = generate_icosahedron(radius=1.0)
    return jsonify({"vertices": vertices.tolist(), "faces": faces.tolist()}), 200

@geometry_api.route('/icosahedron/subdivide', methods=['GET'])
def subdivide_icosahedron():
    try:
        radius = float(request.args.get('radius', 1.0))
        position = json.loads(request.args.get('position', '[0,0,0]'))
        icosahedron = generate_klee_penrose_polyhedron(radius=radius, position=position)
        subdivided = subdivide_faces(icosahedron['vertices'], icosahedron['faces'])
        return jsonify({'vertices': subdivided[0], 'faces': subdivided[1]}), 200
    except Exception as e:
        logger.error(f"Erreur lors de la subdivision de l'icosaèdre : {e}")
        return jsonify({'error': str(e)}), 500

@geometry_api.route('/icosahedron/animate', methods=['GET'])
def animate_icosahedron():
    radius = float(request.args.get('radius', 1.0))
    position_str = request.args.get('position', "[0.0, 0.0, 0.0]")
    rotation_axis_str = request.args.get('rotation_axis', "[0.0, 1.0, 0.0]")
    rotation_angle = float(request.args.get('rotation_angle', 0.0))
    dt = float(request.args.get('dt', DEFAULT_PARAMS['dt']))
    steps = int(request.args.get('steps', DEFAULT_PARAMS['steps']))
    sigma = float(request.args.get('sigma', DEFAULT_PARAMS['sigma']))
    epsilon = float(request.args.get('epsilon', DEFAULT_PARAMS['epsilon']))
    rho = float(request.args.get('rho', DEFAULT_PARAMS['rho']))
    zeta = float(request.args.get('zeta', DEFAULT_PARAMS['zeta']))

    position = parse_float_list(position_str)
    if position is None or len(position) != 3:
        return jsonify({"error": "Invalid position format. Expected list of 3 numbers."}), 400
    position = np.array(position, dtype=float)

    rotation_axis = parse_float_list(rotation_axis_str)
    if rotation_axis is not None and len(rotation_axis) != 3:
        return jsonify({"error": "Invalid rotation_axis format. Expected list of 3 numbers."}), 400
    rotation_axis = np.array(rotation_axis, dtype=float) if rotation_axis else None

    params = {'sigma': sigma, 'epsilon': epsilon, 'rho': rho, 'zeta': zeta}

    try:
        vertices, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
        phi = np.random.normal(scale=0.01, size=len(vertices))
        frames = []
        for _ in range(steps):
            vertices, phi = update_icosahedron_dynamics(vertices, faces, phi, dt, params)
            frames.append({
                'vertices': vertices.tolist(),
                'faces': faces.tolist()
            })
        return jsonify({'frames': frames})
    except Exception as e:
        logger.error(f"Erreur lors de l'animation de l'icosaèdre : {e}")
        return jsonify({'error': f'Erreur lors de l\'animation de l\'icosaèdre : {e}'}), 500

def get_icosahedron_animate(steps=10, radius=1.0, position=None, rotation_axis=None, rotation_angle=0.0,
                            dt=0.01, sigma=10.0, epsilon=0.3, rho=28.0, zeta=2.1):
    if position is None:
        position = np.zeros(3)
    if rotation_axis is None:
        rotation_axis = np.array([0.0, 1.0, 0.0])
    params = {'sigma': sigma, 'epsilon': epsilon, 'rho': rho, 'zeta': zeta}
    vertices, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
    phi = np.random.normal(scale=0.01, size=len(vertices))
    frames = []
    for _ in range(steps):
        vertices, phi = update_icosahedron_dynamics(vertices, faces, phi, dt, params)
        frames.append({
            'vertices': vertices.tolist(),
            'faces': faces.tolist()
        })
    return frames

# --- ROUTES POUR LA SPIRALE TORIQUE ---
@geometry_api.route('/toroidal_spiral/initial', methods=['GET'])
def get_initial_toroidal_spiral():
    R = float(request.args.get('R', 8.0))
    r = float(request.args.get('r', 2.0))
    n_turns = int(request.args.get('n_turns', 3))
    n_points = int(request.args.get('n_points', 24))
    try:
        spiral_system = generate_toroidal_spiral_system(R, r, n_turns, n_points)
        return jsonify(spiral_system)
    except Exception as e:
        logger.error(f"Erreur lors de la génération de la spirale toroïdale : {e}")
        return jsonify({'error': f'Erreur lors de la génération de la spirale toroïdale : {e}'}), 500

@geometry_api.route('/toroidal_spiral/animate', methods=['GET'])
def animate_toroidal_spiral():
    try:
        steps = int(request.args.get('steps', 80))
        R = float(request.args.get('R', 8.0))
        r = float(request.args.get('r', 2.0))
        n_turns = int(request.args.get('n_turns', 3))
        n_points = int(request.args.get('n_points', 24))
        chaos_factor = float(request.args.get('chaos_factor', 0.05))
        noise_level = float(request.args.get('noise_level', 0.1))
        system = generate_toroidal_spiral_system(R, r, n_turns, n_points)
        frames = []
        current_state = system
        for _ in range(steps):
            current_state = update_toroidal_spiral_dynamics(
                current_state, chaos_factor=chaos_factor, noise_level=noise_level
            )
            frames.append({
                'spiral': {
                    'points': current_state['spiral']['points']
                }
            })
        return jsonify({'frames': frames}), 200
    except Exception as e:
        logger.error(f"Erreur lors de l'animation de la spirale toroïdale : {e}")
        return jsonify({'error': str(e)}), 500

# --- ROUTES POUR LES CUBES ---
@geometry_api.route('/cubes/initial', methods=['GET'])
def get_initial_cubes():
    num_cubes = int(request.args.get('num_cubes', DEFAULT_CUBES_CONFIG['num_cubes']))
    cube_size = float(request.args.get('cube_size', DEFAULT_CUBES_CONFIG['cube_size']))
    num_balls_per_cube = int(request.args.get('num_balls_per_cube', DEFAULT_CUBES_CONFIG['num_balls_per_cube']))
    space_bounds = float(request.args.get('space_bounds', DEFAULT_CUBES_CONFIG['space_bounds']))

    try:
        cubes_system = CubeGenerator().generate_cubes_system(
            num_cubes=num_cubes,
            cube_size=cube_size,
            num_balls_per_cube=num_balls_per_cube,
            space_bounds=space_bounds
        )
        
        # Validation des propriétés pour chaque cube
        validated_cubes = []
        for cube in cubes_system:
            validated_cube = {
                'position': cube.get('position', [0, 0, 0]),
                'rotation': cube.get('rotation', [0, 0, 0]),
                'size': cube.get('size', cube_size),
                'color': cube.get('color', '#3498db'),
                'balls': cube.get('balls', [
                    {'position': [0, 0, 0]},
                    {'position': [1, 1, 1]},
                    {'position': [-1, -1, -1]}
                ])
            }
            validated_cubes.append(validated_cube)
        
        return jsonify({
            "cubes": validated_cubes,
            "metadata": {
                "num_cubes": num_cubes,
                "cube_size": cube_size,
                "num_balls_per_cube": num_balls_per_cube,
                "space_bounds": space_bounds
            }
        })
    except Exception as e:
        logger.error(f"Erreur lors de la génération des cubes : {e}")
        return jsonify({'error': f'Erreur lors de la génération des cubes : {e}'}), 500

@geometry_api.route('/cubes/animate', methods=['GET'])
def animate_cubes():
    steps = int(request.args.get('steps', 10))
    generator = CubeGenerator()

    try:
        # Génération initiale avec validation
        initial_data = []
        for cube in generator.generate_cubes_system():
            validated_cube = {
                'position': cube.get('position', [0, 0, 0]),
                'rotation': cube.get('rotation', [0, 0, 0]),
                'size': cube.get('size', 8.0),
                'color': cube.get('color', '#3498db')
            }
            initial_data.append(validated_cube)

        frames = [{"cubes": initial_data}]

        # Génération des frames suivantes
        for _ in range(steps):
            updated_data = []
            for cube in frames[-1]["cubes"]:
                updated_cube = update_cubes_dynamics(cube)
                # Garantir les propriétés manquantes
                updated_cube.setdefault('position', cube.get('position', [0, 0, 0]))
                updated_cube.setdefault('rotation', cube.get('rotation', [0, 0, 0]))
                updated_cube.setdefault('size', cube.get('size', 8.0))
                updated_cube.setdefault('color', cube.get('color', '#3498db'))
                updated_data.append(updated_cube)
            
            frames.append({"cubes": updated_data})

        return jsonify({'frames': frames})
    
    except Exception as e:
        logger.error(f"Erreur lors de l'animation des cubes : {e}")
        return jsonify({'error': str(e)}), 500

# --- ROUTE POUR LA SPIRALE ---
@geometry_api.route('/spiral/initial', methods=['GET'])
def get_initial_spiral():
    try:
        spiral = generate_spiral_simple_initial()
        if "error" in spiral:
            return jsonify({"error": spiral["error"]}), 500
        return jsonify(spiral), 200
    except Exception as e:
        logger.error(f"Erreur dans /geometry/spiral_simple/initial : {e}")
        return jsonify({"error": str(e)}), 500

@geometry_api.route('/spiral/animate', methods=['GET'])
def animate_spiral_route():
    steps = int(request.args.get('steps', 10))
    delta_time = float(request.args.get('dt', 0.01))
    try:
        animation = animate_spiral_simple(steps, delta_time)
        if "error" in animation:
            return jsonify({"error": animation["error"]}), 500
        return jsonify(animation), 200
    except Exception as e:
        logger.error(f"Erreur dans /geometry/spiral_simple/animate : {e}")
        return jsonify({"error": str(e)}), 500

@geometry_api.route('/spiral_simple/initial', methods=['GET'])
def get_initial_spiral_simple():
    try:
        spiral = generate_spiral_simple_initial()
        if "error" in spiral:
            return jsonify({"error": spiral["error"]}), 500
        return jsonify(spiral), 200
    except Exception as e:
        logger.error(f"Erreur dans /geometry/spiral_simple/initial : {e}")
        return jsonify({"error": str(e)}), 500

@geometry_api.route('/spiral_simple/animate', methods=['GET'])
def animate_spiral_simple_route():
    steps = int(request.args.get('steps', 5))
    delta_time = float(request.args.get('dt', 0.01))
    try:
        # Génère l'état initial
        spiral = generate_spiral_simple_initial()
        if "error" in spiral:
            return jsonify({"error": spiral["error"]}), 500
        frames = [spiral]
        for _ in range(steps - 1):
            spiral = animate_spiral_simple(spiral, delta_time)
            frames.append(spiral)
        return jsonify({"frames": frames}), 200
    except Exception as e:
        logger.error(f"Erreur dans /geometry/spiral_simple/animate : {e}")
        return jsonify({"error": str(e)}), 500
    
# --- FONCTIONS UTILES POUR LA SUBDIVISION ---
def subdivide_faces(vertices, faces):
    import numpy as np
    # Toujours convertir en liste Python
    new_vertices = vertices.tolist() if isinstance(vertices, np.ndarray) else list(vertices)
    new_faces = []
    for face in faces:
        v1, v2, v3 = [new_vertices[i] for i in face]
        mid1 = [(v1[i] + v2[i]) / 2 for i in range(3)]
        mid2 = [(v2[i] + v3[i]) / 2 for i in range(3)]
        mid3 = [(v3[i] + v1[i]) / 2 for i in range(3)]
        new_vertices.extend([mid1, mid2, mid3])
        idx = len(new_vertices)
        new_faces.extend([
            [face[0], idx-3, idx-1],
            [face[1], idx-2, idx-3],
            [face[2], idx-1, idx-2],
            [idx-3, idx-2, idx-1]
        ])
    return new_vertices, new_faces

# --- ALIAS POUR LA COMPATIBILITÉ FRONTEND ---
@geometry_api.route('/spiral_torus/initial', methods=['GET'])
def get_initial_spiral_torus():
    """Alias pour la spirale toroïdale."""
    return get_initial_toroidal_spiral()

@geometry_api.route('/spiral_torus/animate', methods=['GET'])
def animate_spiral_torus_route():
    """Alias pour l'animation de la spirale toroïdale."""
    return animate_toroidal_spiral()

@geometry_api.route('/torus_spring/initial', methods=['GET'])
def get_initial_torus_spring():
    """Génère le système tore-ressorts-sphères initial."""
    try:
        system = generate_torus_spring_system()
        return jsonify(system)
    except Exception as e:
        logger.error(f"Erreur torus-spring initial: {e}")
        return jsonify({"error": str(e)}), 500

@geometry_api.route('/torus_spring/animate', methods=['GET'])
def animate_torus_spring():
    """Animation du système tore-ressorts-sphères."""
    try:
        frames = []
        system = generate_torus_spring_system()
        
        for i in range(10):
            system = update_torus_spring_dynamics(system)
            frames.append({
                "spheres": system["spheres"],
                "springs": system["springs"],
                "torus": system["torus"]
            })
        
        return jsonify({"frames": frames})
    except Exception as e:
        logger.error(f"Erreur animation torus-spring: {e}")
        return jsonify({"error": str(e)}), 500
