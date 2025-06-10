# backend/geometry_api.py

from flask import Blueprint, jsonify, request
import numpy as np
from typing import Optional, List
import json

# --- IMPORTS DES MODULES DE GÉOMÉTRIE 
# Icosaèdre
from .geometry.icosahedron.generator import generate_icosahedron
from .geometry.icosahedron.dynamics import update_icosahedron_dynamics

# Pyramides
from .geometry.pyramids.generator import generate_pyramids_system
from .geometry.pyramids.dynamics import update_pyramids_dynamics

# Cubes
from .geometry.cubes.generator import CubeGenerator
from .geometry.cubes.dynamics import update_cubes_dynamics

# Commun
from .geometry.common import subdivide_faces, rotation_matrix


geometry_api = Blueprint('geometry_api', __name__)

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

def parse_float_list(s: str) -> Optional[List[float]]:
    try:
        data = json.loads(s)
        if isinstance(data, list) and all(isinstance(x, (int, float)) for x in data):
            return [float(x) for x in data]
        return None
    except (json.JSONDecodeError, TypeError):
        return None

# ------------------ ICOSAEDRE ------------------

@geometry_api.route('/icosahedron/initial', methods=['GET'])
def get_initial_icosahedron():
    radius = float(request.args.get('radius', 1.0))
    position_str = request.args.get('position', "[0.0, 0.0, 0.0]")
    rotation_axis_str = request.args.get('rotation_axis', "[0.0, 1.0, 0.0]")
    rotation_angle = float(request.args.get('rotation_angle', 0.0))

    position = parse_float_list(position_str)
    if position is None or len(position) != 3:
        return jsonify({"error": "Invalid position format. Expected list of 3 numbers."}), 400
    position = np.array(position, dtype=float)

    rotation_axis = parse_float_list(rotation_axis_str)
    if rotation_axis is not None and len(rotation_axis) != 3:
        return jsonify({"error": "Invalid rotation_axis format. Expected list of 3 numbers."}), 400
    rotation_axis = np.array(rotation_axis, dtype=float) if rotation_axis else None

    try:
        vertices, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
        return jsonify({
            'vertices': vertices.tolist(),
            'faces': faces.tolist()
        })
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération de l\'icosaèdre : {e}'}), 500

@geometry_api.route('/icosahedron/subdivide', methods=['GET'])
def get_subdivided_icosahedron():
    radius = float(request.args.get('radius', 1.0))
    position_str = request.args.get('position', "[0.0, 0.0, 0.0]")
    rotation_axis_str = request.args.get('rotation_axis', "[0.0, 1.0, 0.0]")
    rotation_angle = float(request.args.get('rotation_angle', 0.0))

    position = parse_float_list(position_str)
    if position is None or len(position) != 3:
        return jsonify({"error": "Invalid position format. Expected list of 3 numbers."}), 400
    position = np.array(position, dtype=float)

    rotation_axis = parse_float_list(rotation_axis_str)
    if rotation_axis is not None and len(rotation_axis) != 3:
        return jsonify({"error": "Invalid rotation_axis format. Expected list of 3 numbers."}), 400
    rotation_axis = np.array(rotation_axis, dtype=float) if rotation_axis else None

    try:
        vertices, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
        new_vertices, new_faces = subdivide_faces(vertices, faces)
        return jsonify({
            'vertices': new_vertices.tolist(),
            'faces': new_faces.tolist()
        })
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la subdivision de l\'icosaèdre : {e}'}), 500

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
        # Correction : vérifier que frames n'est pas vide
        if not frames:
            return jsonify({'error': "Aucune frame générée"}), 500
        return jsonify({'frames': frames})
    except Exception as e:
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

# ------------------ PYRAMIDES ------------------

@geometry_api.route('/pyramids/initial', methods=['GET'])
def get_initial_pyramids():
    base_size = float(request.args.get('base_size', 5.0))
    num_layers = int(request.args.get('num_layers', 3))
    brick_size = float(request.args.get('brick_size', 1.0))
    try:
        pyramids_system = generate_pyramids_system(base_size, num_layers, brick_size)
        return jsonify(pyramids_system)
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération des pyramides : {e}'}), 500

@geometry_api.route('/pyramids/animate', methods=['GET'])
def animate_pyramids():
    base_size = float(request.args.get('base_size', 5.0))
    num_layers = int(request.args.get('num_layers', 3))
    brick_size = float(request.args.get('brick_size', 1.0))
    steps = int(request.args.get('steps', DEFAULT_PARAMS['steps']))
    time_step = float(request.args.get('dt', DEFAULT_PARAMS['dt']))
    chaos_factor = float(request.args.get('chaos_factor', DEFAULT_PARAMS['chaos_factor']))
    noise_level = float(request.args.get('noise_level', DEFAULT_PARAMS['noise_level']))

    try:
        pyramids_system = generate_pyramids_system(base_size, num_layers, brick_size)
        frames = []
        current_system_state = pyramids_system
        for _ in range(steps):
            current_system_state = update_pyramids_dynamics(current_system_state, time_step, chaos_factor, noise_level)
            frame_data = {
                "pyramids": []
            }
            for p in current_system_state["pyramids"]:
                pyramid_frame = {
                    "id": p["id"],
                    "bricks_positions": [b["position"] for b in p["bricks"]],
                    "brick_size": brick_size
                }
                frame_data["pyramids"].append(pyramid_frame)
            frames.append(frame_data)
        # Correction : vérifier que frames n'est pas vide
        if not frames:
            return jsonify({'error': "Aucune frame générée"}), 500
        return jsonify({'frames': frames})
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'animation des pyramides : {e}'}), 500

# ------------------ CUBES ------------------

@geometry_api.route('/cubes/initial', methods=['GET'])
def cubes_initial():
    try:
        num_cubes = int(request.args.get('num_cubes', 3))
        cube_size = float(request.args.get('cube_size', 8.0))
        num_balls_per_cube = int(request.args.get('num_balls_per_cube', 3))
        space_bounds = float(request.args.get('space_bounds', 30.0))
        generator = CubeGenerator()
        cubes_system = generator.generate_cubes_system(
            num_cubes=num_cubes,
            cube_size=cube_size,
            num_balls_per_cube=num_balls_per_cube,
            space_bounds=space_bounds
        )
        return jsonify({
            'cubes': cubes_system,
            'metadata': {
                'num_cubes': num_cubes,
                'cube_size': cube_size,
                'num_balls_per_cube': num_balls_per_cube,
                'space_bounds': space_bounds
            }
        })
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la génération des cubes : {e}'}), 500

@geometry_api.route('/cubes/animate', methods=['GET'])
def animate_cubes():
    try:
        num_cubes = int(request.args.get('num_cubes', 3))
        cube_size = float(request.args.get('cube_size', 8.0))
        num_balls_per_cube = int(request.args.get('num_balls_per_cube', 3))
        confinement_size = float(request.args.get('space_bounds', 30.0))
        steps = int(request.args.get('steps', 150))
        dt = float(request.args.get('dt', 0.03))
        chaos = float(request.args.get('chaos', 0.7))

        generator = CubeGenerator()
        cubes_system = generator.generate_cubes_system(
            num_cubes=num_cubes,
            cube_size=cube_size,
            num_balls_per_cube=num_balls_per_cube,
            space_bounds=confinement_size
        )

        frames = []
        current_system = cubes_system
        for _ in range(steps):
            current_system = update_cubes_dynamics(
                current_system, delta_time=dt, confinement_size=confinement_size, chaos=chaos
            )
            frame_data = {
                "cubes": [
                    {
                        "id": cube["id"],
                        "position": cube["position"],
                        "size": cube["size"],
                        "rotation": cube["rotation"],
                        "balls_positions": [ball["position"] for ball in cube["balls"]],
                        "ball_radius": cube["balls"][0]["radius"] if cube["balls"] else cube_size / 8.0
                    }
                    for cube in current_system
                ]
            }
            frames.append(frame_data)
        return jsonify({'frames': frames})
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'animation des cubes : {e}'}), 500
    
@geometry_api.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Blueprint geometry_api fonctionne"})