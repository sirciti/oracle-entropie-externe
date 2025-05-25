# backend/geometry_api.py

from flask import Blueprint, jsonify, request
import numpy as np
from typing import Tuple, Optional, List, Dict, Any
import json

# --- IMPORTS DES MODULES DE GÉOMÉTRIE (NOUVELLE ARBORESCENCE) ---
# Icosaèdre
from .geometry.icosahedron.generator import generate_icosahedron # Générateur d'icosaèdre
from .geometry.icosahedron.dynamics import update_icosahedron_dynamics # Dynamique de l'icosaèdre

# Pyramides
from .geometry.pyramids.generator import generate_pyramids_system
from .geometry.pyramids.dynamics import update_pyramids_dynamics

# --- IMPORTS DES FONCTIONS GÉOMÉTRIQUES COMMUNES ---
from .geometry.common import subdivide_faces, rotation_matrix

geometry_api = Blueprint('geometry_api', __name__)

# Paramètres par défaut pour la dynamique (partagés par les deux géométries si applicable)
DEFAULT_PARAMS = {
    'sigma': 10.0,
    'epsilon': 0.3,
    'rho': 28.0,
    'zeta': 2.1,
    'dt': 0.01,
    'steps': 10,  # nombre d’étapes temporelles à simuler
    'chaos_factor': 0.05, # Ajouté pour la dynamique des pyramides
    'noise_level': 0.1 # Ajouté pour la dynamique des pyramides
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

# ----------------------------------------------------------------------
# ROUTES POUR L'ICOSAÈDRE
# ----------------------------------------------------------------------

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
            vertices, phi = update_icosahedron_dynamics(vertices, faces, phi, dt, params)
            frames.append({
                'vertices': vertices.tolist(),
                'faces': faces.tolist()
            })
        return jsonify({'frames': frames})
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'animation de l\'icosaèdre : {e}'}), 500

def get_icosahedron_animate(steps=10, radius=1.0, position=None, rotation_axis=None, rotation_angle=0.0,
                            dt=0.01, sigma=10.0, epsilon=0.3, rho=28.0, zeta=2.1):
    """
    Fonction utilitaire pour générer les frames d'animation de l'icosaèdre (sans passer par Flask).
    """
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

# ----------------------------------------------------------------------
# ROUTES POUR LES PYRAMIDES (NOUVELLES)
# ----------------------------------------------------------------------

@geometry_api.route('/pyramids/initial', methods=['GET'])
def get_initial_pyramids():
    """
    Génère et renvoie les données du système de pyramides initial.
    """
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
    """
    Simule la dynamique temporelle sur le système de pyramides.
    """
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
        return jsonify({'frames': frames})
    except Exception as e:
        return jsonify({'error': f'Erreur lors de l\'animation des pyramides : {e}'}), 500