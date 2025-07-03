import numpy as np
from typing import Tuple, Optional, List, Set, Dict
from math import sqrt
from ..common import rotation_matrix  # Importe les utilitaires partagés depuis common.py
import logging

logger = logging.getLogger(__name__)

def generate_icosahedron(
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Génère les sommets et les faces d'un icosaèdre régulier paramétrable.
    """
    if position is None:
        position = np.zeros(3)
    phi = (1 + sqrt(5.0)) / 2
    vertices = np.array([
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ], dtype=np.float64)

    vertices /= np.linalg.norm(vertices[0])
    vertices *= radius

    if rotation_axis is not None and rotation_angle != 0.0:
        R = rotation_matrix(rotation_axis, rotation_angle)
        vertices = vertices @ R.T

    vertices += position

    faces = np.array([
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ], dtype=np.int32)

    return vertices, faces

def loop_subdivision(
    vertices: np.ndarray,
    faces: np.ndarray,
    iterations: int = 1
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applique une subdivision topologique itérative d'un maillage triangulaire.
    Utilise subdivide_faces de common.py.
    """
    current_vertices = np.array(vertices, dtype=np.float64)
    current_faces = np.array(faces, dtype=np.int32)

    for _ in range(iterations):
        current_vertices, current_faces = subdivide_faces(current_vertices, current_faces)

    return current_vertices, current_faces

def generate_klee_penrose_polyhedron(
    subdivisions: int = 3,
    radius: float = 1.0,
    position: Optional[np.ndarray] = None,
    rotation_axis: Optional[np.ndarray] = None,
    rotation_angle: float = 0.0
) -> dict:
    """
    Génère une approximation du Polyèdre de Klee-Penrose par subdivision d'un icosaèdre.
    """
    try:
        ico_vertices, ico_faces = generate_icosahedron(radius, position, rotation_axis, rotation_angle)
        subdivided_vertices, subdivided_faces = loop_subdivision(ico_vertices, ico_faces, subdivisions)

        if position is not None:
            subdivided_vertices = subdivided_vertices + np.array(position)
        return {
            'vertices': subdivided_vertices.tolist(),
            'faces': subdivided_faces.tolist()
        }
    except Exception as e:
        logger.error(f"Erreur dans generate_klee_penrose_polyhedron : {e}")
        raise

def subdivide_faces(vertices, faces):
    try:
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
        return np.array(new_vertices, dtype=np.float64), np.array(new_faces, dtype=np.int32)
    except Exception as e:
        logger.error(f"Erreur dans subdivide_faces : {e}")
        raise

# --- ALIAS POUR COMPATIBILITÉ AVEC L'ANCIEN CODE ---
def generate_icosahedron_data(*args, **kwargs):
    """Alias pour compatibilité avec l'ancien code."""
    return generate_icosahedron(*args, **kwargs)
