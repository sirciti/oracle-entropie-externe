from flask import Flask, jsonify, Blueprint, request
import numpy as np
from typing import Tuple, Optional
from .geometry import generate_icosahedron, subdivide_faces  # Import des fonctions de geometry.py
import json

geometry_api = Blueprint('geometry_api', __name__)

def validate_coordinates(coords: list) -> bool:
    """Valide si les coordonnées sont des listes de 3 nombres."""
    if not isinstance(coords, list):
        return False
    for coord in coords:
        if not isinstance(coord, list) or len(coord) != 3 or not all(isinstance(c, (int, float)) for c in coord):
            return False
    return True

@geometry_api.route('/icosahedron/initial', methods=['GET'])
def get_initial_icosahedron():
    """Génère et renvoie les données de l'icosaèdre initial."""

    # Récupération des paramètres depuis la configuration (ou des valeurs par défaut)
    radius = float(request.args.get('radius', 1.0))
    try:
        position = json.loads(request.args.get('position', "[0.0, 0.0, 0.0]"))
        if not validate_coordinates([position]):
          return jsonify({"error": "Invalid position format. Expected list of 3 numbers."}), 400
        position = np.array(position)
    except (json.JSONDecodeError, TypeError):
        position = np.array([0.0, 0.0, 0.0])
    try:
        rotation_axis = json.loads(request.args.get('rotation_axis', "[0.0, 1.0, 0.0]"))
        if not validate_coordinates([rotation_axis]):
          return jsonify({"error": "Invalid rotation_axis format. Expected list of 3 numbers."}), 400
        rotation_axis = np.array(rotation_axis)
    except (json.JSONDecodeError, TypeError):
        rotation_axis = None
    rotation_angle = float(request.args.get('rotation_angle', 0.0))

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
    """Subdivise l'icosaèdre et renvoie les nouvelles données."""

    try:
        # Récupération des données de l'icosaèdre initial (vous pouvez adapter la source)
        radius = float(request.args.get('radius', 1.0))
        try:
            position = json.loads(request.args.get('position', "[0.0, 0.0, 0.0]"))
            if not validate_coordinates([position]):
              return jsonify({"error": "Invalid position format. Expected list of 3 numbers."}), 400
            position = np.array(position)
        except (json.JSONDecodeError, TypeError):
            position = np.array([0.0, 0.0, 0.0])
        try:
            rotation_axis = json.loads(request.args.get('rotation_axis', "[0.0, 1.0, 0.0]"))
            if not validate_coordinates([rotation_axis]):
              return jsonify({"error": "Invalid rotation_axis format. Expected list of 3 numbers."}), 400
            rotation_axis = np.array(rotation_axis)
        except (json.JSONDecodeError, TypeError):
            rotation_axis = None
        rotation_angle = float(request.args.get('rotation_angle', 0.0))
        vertices, faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)

        new_vertices, new_faces = subdivide_faces(vertices, faces)
        return jsonify({
            'vertices': new_vertices.tolist(),
            'faces': new_faces.tolist()
        })
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la subdivision de l\'icosaèdre : {e}'}), 500