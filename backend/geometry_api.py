from flask import Blueprint, jsonify, request
import numpy as np
from typing import Tuple, Optional, List
from .geometry import generate_icosahedron, subdivide_faces
from .icosahedron_dynamics import update_vertices
import json

geometry_api = Blueprint('geometry_api', __name__)

DEFAULT_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'steps': 10
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

@geometry_api.route('/icosahedron/initial', methods=['GET'])
def get_initial_icosahedron():
    """
    Génère et renvoie les données de l'icosaèdre initial.
    """
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
    """
    Subdivise l'icosaèdre et renvoie les nouvelles données.
    """
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
    """
    Simule la dynamique temporelle sur l’icosaèdre.

    Paramètres GET optionnels :
        radius, position, rotation_axis, rotation_angle, dt, steps, sigma, epsilon, rho, zeta
    """
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
            vertices, phi = update_vertices(vertices, faces, phi, dt, params)
            frames.append({
                'vertices': vertices.tolist(),
                'faces': faces.tolist()
            })
        return jsonify({'frames': frames})
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'animation de l\'icosaèdre : {e}'}), 500
